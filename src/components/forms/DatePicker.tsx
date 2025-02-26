import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React from 'react';
import { Control, Controller } from 'react-hook-form';

type DatePickerCtrlProps = {
    name: string;
    label: string;
    control: Control<any>;
};

const DatePickerCtrl:React.FC<DatePickerCtrlProps> = ({name, label, control}) => {
    
    return (
        <Controller control={control} name={name} render={({field: {onChange, value}, fieldState: {error}}) => (
            <DatePicker
                label={label}
                value={value}
                onChange={onChange}
                slotProps={{ textField: { error: !!error, helperText: error?.message } }}
                format='DD/MM/YYYY'
            />
        )}
        />
    )
}
export default DatePickerCtrl;