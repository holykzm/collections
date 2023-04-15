import { CloseOutlined } from '@mui/icons-material';
import { Box, Drawer, IconButton, Stack, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from '../../../../../shared/types';
import { UnsavedDialog } from '../../../../components/elements/UnsavedDialog';
import ComposeWrapper from '../../../../components/utilities/ComposeWrapper';
import { FieldContextProvider } from './Context';
import { InputType } from './field-types/Input';
import { InputMultilineType } from './field-types/InputMultiline';
import { SelectDropdownType } from './field-types/SelectDropdown';
import { Props } from './types';
import { BooleanType } from './field-types/Boolean';

const EditField: React.FC<Props> = ({ field, open, onSuccess, onClose }) => {
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [drawerVisibility, setDrawerVisibility] = useState(false);
  const [editing, setEditing] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const onToggle = () => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    onDrawerClose();
  };

  const handleChangeParentViewInvisible = (state: boolean) => {
    setDrawerVisibility(state);
  };

  const onDrawerClose = () => {
    editing ? setOpenUnsavedDialog(true) : onClose();
  };

  // /////////////////////////////////////
  // Edit field interface
  // /////////////////////////////////////

  // Choose to continue editing on the discard of a field edit.
  const handleKeepEditing = () => {
    setOpenUnsavedDialog(false);
  };

  // Choose to discard changes on the discard of a field edit.
  const handleDiscardChanges = () => {
    setOpenUnsavedDialog(false);
    setEditing(false);
    onClose();
  };

  const handleEditing = (unsaved: boolean) => {
    setEditing(unsaved);
  };

  const handleEditedSuccess = (field: Field) => {
    setEditing(false);
    onSuccess(field);
  };

  return (
    <Box>
      <UnsavedDialog
        open={openUnsavedDialog}
        onConfirm={handleDiscardChanges}
        onClose={handleKeepEditing}
      />
      <Drawer
        anchor="right"
        open={open}
        onClose={onToggle()}
        sx={{ zIndex: theme.zIndex.appBar + 200 }}
      >
        <Box sx={{ maxWidth: 660 }} hidden={drawerVisibility}>
          <Stack direction="row" columnGap={2} sx={{ p: 1 }}>
            <IconButton aria-label="close" onClick={onDrawerClose}>
              <CloseOutlined />
            </IconButton>
            <Box display="flex" alignItems="center">
              <Typography variant="h6">{t('edit_field')}</Typography>
            </Box>
          </Stack>
          {field.interface === 'input' && (
            <InputType field={field} onEditing={handleEditing} onSuccess={handleEditedSuccess} />
          )}
          {field.interface === 'inputMultiline' && (
            <InputMultilineType
              field={field}
              onEditing={handleEditing}
              onSuccess={handleEditedSuccess}
            />
          )}
          {(field.interface === 'selectDropdown' || field.interface === 'selectDropdownStatus') && (
            <SelectDropdownType
              field={field}
              onEditing={handleEditing}
              onSuccess={handleEditedSuccess}
              onChangeParentViewInvisible={handleChangeParentViewInvisible}
            />
          )}
          {field.interface === 'boolean' && (
            <BooleanType field={field} onEditing={handleEditing} onSuccess={handleEditedSuccess} />
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default ComposeWrapper({ context: FieldContextProvider })(EditField);
