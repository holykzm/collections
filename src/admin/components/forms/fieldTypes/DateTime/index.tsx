import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Props } from '../types';

export const DateTimeType: React.FC<Props> = ({ register, control, errors, field: meta }) => {
  const { t } = useTranslation();
  const required = meta.required && { required: t('yup.mixed.required') };
  dayjs.extend(utc);
  dayjs.extend(timezone);

  return (
    <Controller
      name={meta.field}
      control={control}
      render={({ field }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            {...register(meta.field, { ...required })}
            format="YYYY-MM-DD HH:mm"
            onChange={(date: Date) => {
              // Converts a date string from the local timezone to UTC.
              field.onChange(dayjs(date).utc().format('YYYY-MM-DD HH:mm'));
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                disabled: Boolean(meta.readonly),
                error: errors[meta.field] !== undefined,
                value: field.value && dayjs.utc(field.value).local(),
              },
            }}
          />
        </LocalizationProvider>
      )}
    />
  );
};