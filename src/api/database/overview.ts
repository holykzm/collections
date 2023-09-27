import { Knex } from 'knex';
import { FieldsService } from '../services/fields.js';
import { ModelsService } from '../services/models.js';
import { RelationsService } from '../services/relations.js';
import { getDatabase } from './connection.js';
import { getSchemaInfo } from './inspector.js';
import { Field, PrimaryKey } from './schemas.js';

export type ModelOverview = {
  id: PrimaryKey | null;
  model: string;
  singleton: boolean;
  statusField: string | null;
  draftValue: string | null;
  publishValue: string | null;
  archiveValue: string | null;
  fields: {
    [name: string]: FieldOverview;
  };
};

export type FieldOverview = {
  field: string;
  special: string | null;
  alias: boolean;
};

export type Relation = {
  model: string;
  field: string;
  relatedField: string;
  relatedModel: string;
};

export type SchemaOverview = {
  models: { [name: string]: ModelOverview };
  relations: Relation[];
};

/**
 * @description get schema overview
 * @param options
 * @returns schema overview
 */
export const getSchemaOverview = async (options?: { database?: Knex }): Promise<SchemaOverview> => {
  const database = options?.database || getDatabase();
  const schemaInfo = await getSchemaInfo(database);
  const schema: SchemaOverview = { models: {}, relations: [] };

  // /////////////////////////////////////
  // Models
  // /////////////////////////////////////
  const modelsService = new ModelsService({ database, schema });
  const models = await modelsService.readMany();

  const fieldsService = new FieldsService({ database, schema });
  const fields = await fieldsService.readMany();

  for (const [model, info] of Object.entries(schemaInfo)) {
    const metaModel = models.find((c) => c.model === model);

    schema.models[model] = {
      id: metaModel ? metaModel.id : null,
      model: model,
      singleton: metaModel && metaModel.singleton ? true : false,
      statusField: metaModel ? metaModel.status_field : null,
      draftValue: metaModel ? metaModel.draft_value : null,
      publishValue: metaModel ? metaModel.publish_value : null,
      archiveValue: metaModel ? metaModel.archive_value : null,
      fields: Object.values(info.columns).reduce(
        (acc, column) => {
          const field = fields.find((f) => f.model === model && f.field === column.column_name);

          acc[column.column_name] = {
            field: column.column_name,
            special: getSpecialField(field || null, column.data_type),
            alias: info.columns[column.column_name] === undefined,
          };
          return acc;
        },
        {} as { [name: string]: FieldOverview }
      ),
    };
  }

  // /////////////////////////////////////
  // Alias fields
  // /////////////////////////////////////
  for (const field of fields) {
    if (!schema.models[field.model]) continue;
    if (schema.models[field.model].fields[field.field]) continue;

    schema.models[field.model].fields[field.field] = {
      field: field.field,
      special: getSpecialField(field, null),
      alias: true,
    };
  }

  // /////////////////////////////////////
  // Relations
  // /////////////////////////////////////
  const relationsService = new RelationsService({ database, schema });
  const relations = await relationsService.readMany();

  schema.relations = relations.map((relation) => {
    return {
      model: relation.one_model,
      field: relation.one_field,
      relatedField: relation.many_field,
      relatedModel: relation.many_model,
    };
  });

  return schema;
};

export const getSpecialField = (field: Field | null, dataType: string | null): string | null => {
  if (field?.special) return field.special;

  switch (dataType) {
    case 'boolean':
      return 'cast-boolean';
    default:
      return null;
  }
};
