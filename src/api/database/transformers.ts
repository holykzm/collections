import dayjs from 'dayjs';
import { InvalidPayloadException } from '../../exceptions/invalidPayload.js';
import { Helpers } from './helpers/index.js';
import { ModelOverview } from './overview.js';

export type Action = 'create' | 'read' | 'update';

type Transformers = {
  [type: string]: (context: { action: Action; value: any; helpers: Helpers }) => Promise<any>;
};

const transformers: Transformers = {
  async createdAt({ action, value, helpers }) {
    switch (action) {
      case 'create':
        return helpers.date.writeTimestamp(new Date().toISOString());
      case 'update':
        if (!value) return value;
        return helpers.date.writeTimestamp(new Date(value).toISOString());
      case 'read':
        return helpers.date.readTimestampString(new Date(value).toISOString());
      default:
        return value;
    }
  },
  async updatedAt({ action, value, helpers }) {
    switch (action) {
      case 'create':
      case 'update':
        return helpers.date.writeTimestamp(new Date().toISOString());
      case 'read':
        return helpers.date.readTimestampString(new Date(value).toISOString());
      default:
        return value;
    }
  },
};

const castTransformers: Transformers = {
  async 'cast-timestamp'({ action, value, helpers }) {
    if (!value) return value;

    const date = dayjs(value);
    if (!date.isValid()) {
      throw new InvalidPayloadException('invalid_date_format');
    }

    switch (action) {
      case 'create':
      case 'update':
        return helpers.date.writeTimestamp(date.toISOString());
      case 'read':
        return helpers.date.readTimestampString(date.toISOString());
      default:
        return value;
    }
  },
  async 'cast-boolean'({ action, value }) {
    if (action === 'read') {
      if (value === true || value === 1 || value === '1') {
        return true;
      } else if (value === false || value === 0 || value === '0') {
        return false;
      } else if (value === null || value === '') {
        return null;
      }
    }

    return value;
  },
};

/**
 * @description Applies transformers to the given data based on the model overview.
 * @param action
 * @param data
 * @param overview
 * @param helpers
 */
export const applyTransformers = async (
  action: Action,
  data: Record<string, any>,
  overview: ModelOverview,
  helpers: Helpers
) => {
  // /////////////////////////////////////
  // Transforms by schema
  // /////////////////////////////////////
  for (const field in overview.fields) {
    if (field in transformers) {
      const itemKey = field as keyof typeof data;
      data[itemKey] = await transformers[field]({
        action,
        value: data[itemKey],
        helpers,
      });
    }
  }

  // /////////////////////////////////////
  // Transforms by data
  // /////////////////////////////////////
  for (const [key, value] of Object.entries(data)) {
    const special = overview.fields[key]?.special;
    if (special && special in castTransformers) {
      data[key] = await castTransformers[special]({
        action,
        value,
        helpers,
      });
    }
  }
};
