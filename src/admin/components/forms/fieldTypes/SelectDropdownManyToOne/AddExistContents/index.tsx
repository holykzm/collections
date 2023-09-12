import { CloseOutlined } from '@ant-design/icons';
import { Box, Button, Divider, Drawer, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { IconButton } from 'superfast-ui';
import { referencedTypes } from '../../../../../../api/database/schemas.js';
import { GetCollection, GetField } from '../../../../../config/types.js';
import {
  ContentContextProvider,
  useContent,
} from '../../../../../pages/collections/Context/index.js';
import { buildColumnFields } from '../../../../../pages/collections/List/buildColumnFields.js';
import { buildColumns } from '../../../../../utilities/buildColumns.js';
import { ScrollBar } from '../../../../elements/ScrollBar/index.js';
import { RadioGroupTable } from '../../../../elements/Table/RadioGroupTable/index.js';
import { ComposeWrapper } from '../../../../utilities/ComposeWrapper/index.js';
import { Props } from './types.js';

const AddExistContentsImpl: React.FC<Props> = ({
  collection,
  field,
  openState,
  onSuccess,
  onClose,
}) => {
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const { getRelations, getContents, getFields, getCollection } = useContent();

  const { data: relations } = getRelations(collection, field);
  const relation = relations[0];

  const { data: relatedCollection } = getCollection(relation.one_collection);
  const { data: fields } = getFields(relation.one_collection);
  const { data: content } = getContents(relation.one_collection);

  // Convert to array in case of singleton.
  const contents = content && !Array.isArray(content) ? [content] : content;

  const getColumns = (relatedCollection: GetCollection, fields: GetField[]) => {
    const filtered = fields.filter((field) => !referencedTypes.includes(field.interface));
    const columnFields = buildColumnFields(relatedCollection, filtered);
    const columns = buildColumns(columnFields);
    return columns;
  };
  const columns = getColumns(relatedCollection, fields);

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
        PaperProps={{
          sx: {
            width: { xs: 340, md: 660 },
          },
        }}
      >
        <ScrollBar
          sx={{
            '& .simplebar-content': {
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4">{t('select_contents')}</Typography>
              <IconButton
                color="secondary"
                size="small"
                sx={{ fontSize: '0.875rem' }}
                onClick={onClose}
              >
                <CloseOutlined />
              </IconButton>
            </Stack>
          </Box>
          <Divider />
          <Box sx={{ p: 3 }}>
            <Stack rowGap={3}>
              <RadioGroupTable columns={columns} rows={contents} onChange={handleSelect} />
              <Button
                variant="contained"
                onClick={onSelected}
                disabled={selectedContent === null}
                size="large"
                fullWidth
              >
                {t('decide')}
              </Button>
            </Stack>
          </Box>
        </ScrollBar>
      </Drawer>
    </Stack>
  );
};

export const AddExistContents = ComposeWrapper({ context: ContentContextProvider })(
  AddExistContentsImpl
);
