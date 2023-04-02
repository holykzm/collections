import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from '../../../../utilities/logger';
import ComposeWrapper from '../../../components/utilities/ComposeWrapper';
import { useDocumentInfo } from '../../../components/utilities/DocumentInfo';
import createCollectionSchema, {
  FormValues,
} from '../../../fields/schemas/collections/createCollection';
import { CollectionContextProvider, useCollection } from '../Context';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localizedLabel } = useDocumentInfo();
  const { enqueueSnackbar } = useSnackbar();
  const { createCollection } = useCollection();
  const { trigger, isMutating } = createCollection;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { collection: '', singleton: false },
    resolver: yupResolver(createCollectionSchema(t)),
  });

  const onSubmit: SubmitHandler<FormValues> = async (form: FormValues) => {
    try {
      const collection = await trigger(form);
      enqueueSnackbar(t('toast.created_successfully'), { variant: 'success' });
      navigate(`../content-types/${collection.id}`);
    } catch (e) {
      logger.error(e);
    }
  };

  return (
    <Stack component="form" onSubmit={handleSubmit(onSubmit)} rowGap={3}>
      <Grid container spacing={2}>
        <Grid xs>
          <h1>{localizedLabel}</h1>
        </Grid>
        <Grid container columnSpacing={2} alignItems="center">
          <Grid>
            <Button variant="contained" type="submit" disabled={isMutating}>
              {t('save')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={3} xs={12} xl={6}>
        <Grid xs={12} md={6}>
          <InputLabel required>{t('name')}</InputLabel>
          <Controller
            name="collection"
            control={control}
            render={({ field }) => (
              <TextField {...field} type="text" fullWidth error={errors.collection !== undefined} />
            )}
          />
          <FormHelperText error>{errors.collection?.message}</FormHelperText>
        </Grid>
        <Grid xs={12} md={6}>
          <InputLabel>{t('content_data_type')}</InputLabel>
          <Controller
            name="singleton"
            control={control}
            render={({ field }) => (
              <FormControlLabel {...field} label="Singleton" control={<Checkbox />} />
            )}
          />
        </Grid>
      </Grid>
      <Grid container xs={12} xl={6}>
        <Typography variant="h6">{t('optional_system_fields')}</Typography>
      </Grid>
      <Grid container spacing={3} xs={12} xl={6}>
        <Grid xs={12} md={6}>
          <InputLabel>{t('public_status')}</InputLabel>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControlLabel {...field} label={t('valid')} control={<Checkbox />} />
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ComposeWrapper({ context: CollectionContextProvider })(CreatePage);
