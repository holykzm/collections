import { t } from 'i18next';
import { LocaleObject } from 'yup';

const locale: LocaleObject = {
  mixed: {
    default: t('yup.mixed.default'),
    required: t('yup.mixed.required'),
    oneOf: ({ values }) => t('yup.mixed.one_of', { values: values }),
    notOneOf: ({ values }) => t('yup.mixed.not_one_of', { values: values }),
    notType: t('yup.mixed.not_type'),
    defined: t('yup.mixed.defined'),
  },
  string: {
    length: ({ length }) => t('yup.string.length', { length: length }),
    min: ({ min }) => t('yup.string.min', { min: min }),
    max: ({ max }) => t('yup.string.max', { max: max }),
    matches: ({ regex }) => t('yup.string.matches', { regex: regex }),
    email: t('yup.string.email'),
    url: t('yup.string.url'),
    uuid: t('yup.string.uuid'),
    trim: t('yup.string.trim'),
    lowercase: t('yup.string.lowercase'),
    uppercase: t('yup.string.uppercase'),
  },
  number: {
    min: ({ min }) => t('yup.number.min', { min: min }),
    max: ({ max }) => t('yup.number.max', { max: max }),
    lessThan: ({ less }) => t('yup.number.less_than', { less: less }),
    moreThan: ({ more }) => t('yup.number.more_than', { more: more }),
    positive: t('yup.number.positive'),
    negative: t('yup.number.negative'),
    integer: t('yup.number.integer'),
  },
  date: {
    min: ({ min }) => t('yup.date.min', { min: min }),
    max: ({ max }) => t('yup.date.max', { max: max }),
  },
  object: {
    noUnknown: t('yup.object.no_unknown'),
  },
  array: {
    length: ({ length }) => t('yup.array.length', { length: length }),
    min: ({ min }) => t('yup.array.min', { min: min }),
    max: ({ max }) => t('yup.array.max', { max: max }),
  },
  boolean: {
    isValue: ({ value }) => t('yup.boolean.is_value', { value: value }),
  },
};

export default locale;
