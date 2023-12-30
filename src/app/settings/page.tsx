"use client";
import { SettingsItem, SettingsStoreService } from "@/setting_store_service";
import {
    Stack,
    Paper,
    PaperProps,
    Switch,
    styled,
    Typography,
    Divider,
    FormControlLabel,
    FormControl,
    FormLabel,
    FormGroup,
    FormHelperText,
    Input,
} from "@mui/material";
import React from "react";

const SettingsItemPaper = styled(
    React.forwardRef<HTMLDivElement, PaperProps>(
        ({ component = "main", ...props }, ref) => (
            <Paper
                component={component}
                ref={ref}
                {...props}
                elevation={10}
                sx={{ padding: 1 }}
            />
        )
    )
)({});

export default function SettingsPage() {
    const [state, setState] = React.useState({
        //idk WHY THE FUCK I HAVE TO DO THIS SHIT === false , the fucking React.js state management is just a piece of shit.
        [SettingsItem.PerformClearWhenReview]: SettingsStoreService.read(SettingsItem.PerformClearWhenReview) as boolean,
    });


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        SettingsStoreService.write(event.target.name, event.target.checked);
        setState({
            ...state,
            [event.target.name]: SettingsStoreService.read(event.target.name),
        });
    };

    return (
        <Stack>
            <SettingsItemPaper>
                <Divider>Timer Settings</Divider>
                <FormControl component="fieldset" variant="standard">
                    <FormGroup>
                        <FormControlLabel
                            labelPlacement="start"
                            control={
                                <Switch checked={state[SettingsItem.PerformClearWhenReview]} onChange={handleChange} name={SettingsItem.PerformClearWhenReview.toString()} />
                            }
                            label={`Perform "Clear" action when "Review"`}
                        />
                    </FormGroup>
                </FormControl>
            </SettingsItemPaper>
        </Stack>
    );
}
