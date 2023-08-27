import knex, { Knex } from 'knex';
import { createMany } from '../../../../src/api/database/operations/createMany.js';
import { deleteMany } from '../../../../src/api/database/operations/deleteMany.js';
import { readByQuery } from '../../../../src/api/database/operations/readByQuery.js';
import { getSchemaOverview } from '../../../../src/api/database/overview.js';
import { User } from '../../../../src/config/types.js';
import { config } from '../../../config.js';
import { testDatabases } from '../../../utilities/testDatabases.js';

describe('Delete Many', () => {
  const tableName = 'superfast_users';
  const databases = new Map<string, Knex>();
  const data: Omit<User, 'id'>[] = [
    {
      name: 'Lando Norris',
      email: 'lando@superfastcms.com',
      password: 'password',
      is_active: true,
      api_key: '1111-2222-4444',
      role_id: 1,
    },
    {
      name: 'Esteban Ocon',
      email: 'esteban@superfastcms.com',
      password: 'password',
      is_active: true,
      api_key: '1111-2222-4444',
      role_id: 1,
    },
  ];

  beforeAll(async () => {
    for (const database of testDatabases) {
      const connection = knex(config.knexConfig[database]!);
      databases.set(database, connection);
    }
  });

  afterAll(async () => {
    for (const [_, connection] of databases) {
      await connection.destroy();
    }
  });

  describe('Delete', () => {
    it.each(testDatabases)('%s - should delete', async (database) => {
      const connection = databases.get(database)!;
      const overview = await getSchemaOverview({ database: connection });
      const keys = await createMany({
        database: connection,
        schema: overview,
        collection: tableName,
        data,
      });

      await deleteMany({
        database: connection,
        collection: tableName,
        keys,
      });

      const result = await readByQuery({
        database: connection,
        schema: overview,
        collection: tableName,
        filter: {
          id: { _in: keys },
        },
      });

      expect(result).toHaveLength(0);
    });
  });
});