import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { referencedTypes } from '../../../../../../server/database/schemas.js';
import {
  ContentContextProvider,
  useContent,
} from '../../../../../pages/collections/Context/index.js';
import { buildColumnFields } from '../../../../../pages/collections/List/buildColumnFields.js';
import { buildColumns } from '../../../../../utilities/buildColumns.js';
import { Cell } from '../../../../elements/Table/Cell/index.js';
import { RadioGroupTable } from '../../../../elements/Table/RadioGroupTable/index.js';
import { Column } from '../../../../elements/Table/types.js';
import { ComposeWrapper } from '../../../../utilities/ComposeWrapper/index.js';
import { theme } from '../../../../utilities/Theme/Default/index.js';
import { Props } from './types.js';

const AddExistContentsImpl: React.FC<Props> = ({
  collection,
  field,
  openState,
  onSuccess,
  onClose,
}) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const { getRelations, getContents, getFields } = useContent();
  const { data: relations } = getRelations(collection, field);
  const relationFetched = (relations && relations[0] !== null) || false;
  const { data: contents } = getContents(
    relations ? relations[0].one_collection : '',
    relationFetched
  );
  const { data: fields } = getFields(relations ? relations[0].one_collection : '', relationFetched);

  useEffect(() => {
    if (fields === undefined) return;
    // excludes referenced fields.
    const filtered = fields.filter((field) => !referencedTypes.includes(field.interface));
    const columnFields = buildColumnFields(filtered);
    const columns = buildColumns(columnFields, (i: number, row: any, data: any) => (
      <Cell colIndex={i} type={columnFields[i].type} rowData={row} cellData={data} />
    ));
    setColumns(columns);
  }, [fields]);

  const handleSelect = (row: any) => {
    setSelectedContent(row);
  };

  const onToggle = () => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    onClose();
  };

  const onSelected = () => {
    onSuccess(selectedContent);
    setSelectedContent(null);
  };

  return (
    <Stack>
      <Drawer
        anchor="right"
        open={openState}
        onClose={onToggle()}
        sx={{ zIndex: theme.zIndex.appBar + 200 }}
      >
        <Box sx={{ width: 660 }}>
          <Stack direction="row" columnGap={2} sx={{ p: 1 }}>
            <IconButton aria-label="close" onClick={onClose}>
              <CloseOutlined />
            </IconButton>
            <Box display="flex" alignItems="center">
              <Typography variant="h6">{t('select_contents')}</Typography>
            </Box>
          </Stack>
          <Stack rowGap={3} sx={{ p: 2 }}>
            {contents !== undefined && (
              <RadioGroupTable columns={columns} rows={contents} onChange={handleSelect} />
            )}
          </Stack>
          <Stack sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={onSelected}
              disabled={selectedContent === null}
              size="large"
              fullWidth
            >
              {t('save')}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
};

export const AddExistContents = ComposeWrapper({ context: ContentContextProvider })(
  AddExistContentsImpl
);
