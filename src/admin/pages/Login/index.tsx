import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  FormHelperText,
  InputLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2.js';
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { logger } from '../../../utilities/logger.js';
import { Loading } from '../../components/elements/Loading/index.js';
import { Logo } from '../../components/elements/Logo/index.js';
import { useAuth } from '../../components/utilities/Auth/index.js';
import { ComposeWrapper } from '../../components/utilities/ComposeWrapper/index.js';
import { FormValues, loginSchema } from '../../fields/schemas/authentications/login.js';
import { LoginContextProvider, useLogin } from './Context/index.js';

const LoginImpl: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const { trigger, isMutating } = login();
  const { getProjectSetting } = useLogin();
  const { data: projectSetting } = getProjectSetting({ suspense: true });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/admin/collections');
    }
  }, [user]);

  const onSubmit: SubmitHandler<FormValues> = async (form: FormValues) => {
    try {
      await trigger(form);
    } catch (e) {
      logger.error(e);
    }
  };

  if (user) {
    return <Loading />;
  }

  return (
    <>
      <Stack direction="row" justifyContent="left" alignItems="center" spacing={2} sx={{ mb: 3.5 }}>
        <Box sx={{ width: '40px', height: '40px' }}>
          <Logo />
        </Box>
        <Typography variant="h3">{projectSetting?.name}</Typography>
      </Stack>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Stack spacing={1}>
              <InputLabel>{t('email')}</InputLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="text" error={errors.email !== undefined} />
                )}
              />
              <FormHelperText error>{errors.email?.message}</FormHelperText>
            </Stack>
          </Grid>
          <Grid xs={12}>
            <Stack spacing={1}>
              <InputLabel>{t('password')}</InputLabel>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="password" error={errors.password !== undefined} />
                )}
              />
              <FormHelperText error>{errors.password?.message}</FormHelperText>
            </Stack>
          </Grid>
          <Grid xs={12} sx={{ mt: -1 }}>
            <Link variant="h6" component={RouterLink} to="/admin/auth/forgot" color="text.primary">
              {t('forgot')}
            </Link>
          </Grid>
          <Grid xs={12}>
            <Button
              disableElevation
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disabled={isMutating}
            >
              {t('login')}
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export const Login = ComposeWrapper({ context: LoginContextProvider })(LoginImpl);
