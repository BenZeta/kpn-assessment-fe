import React from "react";
import { Control, Controller } from "react-hook-form";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

type TimePickerCtrlProps = {
    name: string;
    label: string;
    control: Control<any>;
    onChangeOvr?: any;
    sx?: any;
    rules?: {
        required: string;
        validate?: (value: any, formValues: any) => boolean | string;
    };
};

const TimePickerCtrl: React.FC<TimePickerCtrlProps> = ({
                                                           name,
                                                           label,
                                                           control,
                                                           rules,
                                                           onChangeOvr,
                                                       }) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TimePicker
                    label={label}
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                        if (onChangeOvr !== undefined) {
                            onChangeOvr(e);
                        }
                    }}
                    slotProps={{
                        textField: { error: !!error, helperText: error?.message },
                    }}
                    format="HH:mm"
                />
            )}
        />
    );
};
export default TimePickerCtrl;