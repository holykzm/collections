import express, { Request, Response } from 'express';
import { Field } from '../../config/types.js';
import { RecordNotFoundException } from '../../exceptions/database/recordNotFound.js';
import { SchemaOverview } from '../database/overview.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { permissionsHandler } from '../middleware/permissionsHandler.js';
import { BaseTransaction } from '../repositories/base.js';
import { CollectionsRepository } from '../repositories/collections.js';
import { FieldsRepository } from '../repositories/fields.js';
import { PermissionsRepository } from '../repositories/permissions.js';
import { RelationsRepository } from '../repositories/relations.js';

const router = express.Router();

router.get(
  '/collections/:id',
  permissionsHandler(),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const repository = new CollectionsRepository();

    const collection = await repository.readOne(id);
    if (!collection) throw new RecordNotFoundException('record_not_found');

    res.json({
      collection: {
        ...collection,
        fields: [],
      },
    });
  })
);

router.get(
  '/collections',
  permissionsHandler(),
  asyncHandler(async (req: Request, res: Response) => {
    const repository = new CollectionsRepository();

    const collections = await repository.read();

    res.json({ collections });
  })
);

router.post(
  '/collections',
  permissionsHandler([{ collection: 'superfast_collections', action: 'create' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const repository = new CollectionsRepository();
    const fieldsRepository = new FieldsRepository();

    const data = req.body.status
      ? {
          ...req.body,
          status_field: 'status',
          draft_value: 'draft',
          publish_value: 'published',
          archive_value: 'archived',
        }
      : req.body;
    delete data.status;

    await repository.transaction(async (tx) => {
      const collectionId = await repository.transacting(tx).create(data);

      await tx.transaction.schema.createTable(req.body.collection, (table) => {
        table.increments();
        table.timestamps(true, true);
        req.body.status && table.string('status').notNullable();
      });

      const fields: Field[] = [
        {
          collection: req.body.collection,
          field: 'id',
          label: 'id',
          interface: 'input',
          required: true,
          readonly: true,
          hidden: true,
          special: null,
          sort: null,
          options: null,
        },
        req.body.status && {
          collection: req.body.collection,
          field: 'status',
          label: 'Status',
          interface: 'selectDropdownStatus',
          required: true,
          readonly: false,
          hidden: false,
          special: null,
          sort: null,
          options: JSON.stringify({
            choices: [
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
              { label: 'Archived', value: 'archived' },
            ],
          }),
        },
      ];
      await fieldsRepository.transacting(tx).createMany(fields);

      res.json({ id: collectionId });
    });
  })
);

router.patch(
  '/collections/:id',
  permissionsHandler([{ collection: 'superfast_collections', action: 'update' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const repository = new CollectionsRepository();
    const fieldsRepository = new FieldsRepository();

    await repository.transaction(async (tx) => {
      await repository.transacting(tx).update(id, req.body);

      if (req.body.status_field) {
        const collection = await repository.transacting(tx).readOne(id);
        const fields = await fieldsRepository
          .transacting(tx)
          .read({ collection: collection.collection, field: req.body.status_field });

        await fieldsRepository.transacting(tx).update(fields[0].id, {
          interface: 'selectDropdownStatus',
          required: true,
          options: JSON.stringify({
            choices: [
              { label: req.body.draft_value, value: req.body.draft_value },
              { label: req.body.publish_value, value: req.body.publish_value },
              { label: req.body.archive_value, value: req.body.archive_value },
            ],
          }),
        });
      }
    });

    res.status(204).end();
  })
);

/**
 * Delete a collection.
 * Execute in order of relation -> entity to avoid DB constraint errors.
 */
router.delete(
  '/collections/:id',
  permissionsHandler([{ collection: 'superfast_collections', action: 'delete' }]),
  asyncHandler(async (req: Request, res: Response) => {
    const repository = new CollectionsRepository();
    const fieldsRepository = new FieldsRepository();
    const permissionsRepository = new PermissionsRepository();
    const relationsRepository = new RelationsRepository();

    const id = Number(req.params.id);
    const collection = await repository.readOne(id);

    await repository.transaction(async (tx) => {
      /////////////////////////// Delete Relation ///////////////////////////
      await repository.transacting(tx).delete(id);
      await fieldsRepository.transacting(tx).deleteMany({ collection: collection.collection });
      await permissionsRepository.transacting(tx).deleteMany({ collection: collection.collection });

      // Delete many relation fields
      const oneRelations = await relationsRepository
        .transacting(tx)
        .read({ one_collection: collection.collection });

      for (let relation of oneRelations) {
        await deleteField(req.schema, tx, relation.many_collection, relation.many_field);
      }

      // Delete one relation fields
      const manyRelations = await relationsRepository.transacting(tx).read({
        many_collection: collection.collection,
      });

      for (let relation of manyRelations) {
        await deleteField(req.schema, tx, relation.one_collection, relation.one_field);
      }

      // Delete relations
      await relationsRepository
        .transacting(tx)
        .deleteMany({ many_collection: collection.collection });

      await relationsRepository
        .transacting(tx)
        .deleteMany({ one_collection: collection.collection });

      /////////////////////////// Delete Entity ///////////////////////////

      await tx.transaction.schema.dropTable(collection.collection);

      res.status(204).end();
    });
  })
);

/**
 * Delete meta and entity fields.
 *
 * @param schema
 * @param tx
 * @param collection
 * @param field
 */
const deleteField = async (
  schema: SchemaOverview,
  tx: BaseTransaction,
  collection: string,
  field: string
) => {
  const hasEntity = !schema.collections[collection].fields[field].alias;
  const existingRelation = schema.relations.find(
    (existingRelation) =>
      (existingRelation.collection === collection && existingRelation.field === field) ||
      (existingRelation.relatedCollection === collection && existingRelation.relatedField === field)
  );

  if (hasEntity) {
    await tx.transaction.schema.table(collection, (table) => {
      // If the FK already exists in the DB, drop it first
      if (existingRelation !== undefined) table.dropForeign(field);
      table.dropColumn(field);
    });
  }

  const repository = new FieldsRepository();
  await repository.transacting(tx).deleteMany({
    collection,
    field,
  });
};

export const collections = router;