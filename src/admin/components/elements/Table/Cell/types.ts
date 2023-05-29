export const Type = {
  Text: 'text',
  Number: 'number',
  Date: 'date',
  Object: 'object',
  Status: 'status',
  Boolean: 'boolean',
} as const;

export type Props = {
  colIndex: number;
  type: (typeof Type)[keyof typeof Type];
  cellData: unknown;
};
