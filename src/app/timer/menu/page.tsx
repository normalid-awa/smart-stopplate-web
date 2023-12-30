"use client";
import { BLEStopplateService } from "@/ble_service";
import { Buzzer, BuzzerWaveformObject, beep } from "@/buzzer";
import { Delay } from "@/utils";
import {
    Stack,
    Button,
    ButtonGroup,
    Divider,
    Typography,
    TextField,
    Slider,
    InputAdornment,
    styled,
    Paper,
    FormControl,
    InputLabel,
    Input,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import React from "react";

const SettingTagTypography = styled(Typography)(({ theme }) => ({
    ...theme.typography.caption,
    textAlign: "center",
}));
const SettingControllTextField = styled(TextField)(({ theme }) => ({
    width: "6rem",
}));

const NUMBERONLYREGEX = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/g;

interface Range {
    max: number;
    min: number;
}

var is_apply = false;

export default function TiemrMenu() {
    const [
        stopplateIndicatorLightUpDuration,
        setStopplateIndicatorLightUpDuration,
    ] = React.useState<number>(0);
    const handleStopplateIndicatorLightUpDurationChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (
            event.target.value === "" ||
            NUMBERONLYREGEX.test(event.target.value)
        ) {
            var val = parseFloat(event.target.value);
            if (isNaN(parseFloat(event.target.value))) {
                val = 0;
            }
            setStopplateIndicatorLightUpDuration(val);
        }
    };
    const [timerCountdownRandomRange, setTimerCountdownRandomRange] =
        React.useState<Range>({ max: 0, min: 0 });
    const handleTimerCountdownRangeChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        min: boolean
    ) => {
        var val = parseFloat(event.target.value);
        if (isNaN(val)) val = 0;
        if (min) {
            setTimerCountdownRandomRange({
                min: val,
                max: timerCountdownRandomRange.max,
            });
        } else {
            setTimerCountdownRandomRange({
                max: val,
                min: timerCountdownRandomRange.min,
            });
        }
    };

    const [buzzerSoundDuration, setBuzzerSoundDuration] =
        React.useState<number>(0);
    const handleBuzzerSoundDurationChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        var val = parseFloat(event.target.value);
        if (isNaN(val)) val = 0;
        setBuzzerSoundDuration(val);
    };

    const [buzzerSoundFrequency, setBuzzerSoundFrequency] =
        React.useState<number>(0);
    const handleBuzzerSoundFrequencyChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        var val = parseFloat(event.target.value);
        if (isNaN(val)) val = 0;
        setBuzzerSoundFrequency(val);
    };

    const [buzzerSoundWaveform, setBuzzerWaveform] =
        React.useState<OscillatorType>("sawtooth");
    const handleBuzzerWaveformChange = (event: SelectChangeEvent) => {
        setBuzzerWaveform(event.target.value as OscillatorType);
    };

    const [isStopplateConnected, setIsStopplateConnected] =
        React.useState<boolean>(false);

    const stick_activation_handler = (event: BeforeUnloadEvent) => {
        // Cancel the event as stated by the standard.
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = "Sure?";
    }

    React.useEffect(() => {
        //prevent user leave before apply their settings
        is_apply = false;
        window.addEventListener("beforeunload", stick_activation_handler);
        update_connect_state();
        return () => {
            console.log("unload");
            window.removeEventListener("beforeunload", stick_activation_handler);
        }
    }, []);

    const apply_settings = () => {
        is_apply = true;
        BLEStopplateService.getInstance().write_setting(
            stopplateIndicatorLightUpDuration,
            timerCountdownRandomRange.min,
            timerCountdownRandomRange.max,
            buzzerSoundDuration,
            buzzerSoundFrequency,
            BuzzerWaveformObject.findIndex((value, index) => {
                if (value == buzzerSoundWaveform)
                    return index
            })
        );
    };

    async function connect_to_ble_stopplate() {
        await BLEStopplateService.getInstance().scan_and_connect_stopplate();
        update_connect_state();
        await Delay(500);
        update_connect_state();
        await Delay(500);
        update_setting_from_stopplate();
    }

    async function disconnect() {
        BLEStopplateService.getInstance().disconnect();
        update_connect_state();
    }
    React.useMemo(() => {
        update_connect_state();
        update_setting_from_stopplate();
    }, [])

    async function update_setting_from_stopplate() {
        console.log('update_setting_from_stopplate', BLEStopplateService.getInstance().is_connected);
        if (BLEStopplateService.getInstance().is_connected) {
            try {
                let setting = await BLEStopplateService.getInstance().get_settings();
                console.log(setting);
                setStopplateIndicatorLightUpDuration(setting.indicator_light_up_duration);
                setTimerCountdownRandomRange({
                    min: setting.countdown_random_time_min,
                    max: setting.countdown_random_time_max
                });
                setBuzzerSoundDuration(setting.buzzer_duration);
                setBuzzerSoundFrequency(setting.buzzer_frequency);
                setBuzzerWaveform(BuzzerWaveformObject[setting.buzzer_waveform]);
            } catch (e) {
                update_setting_from_stopplate();
                return;
            }
        }
    }

    async function update_connect_state() {
        setIsStopplateConnected(BLEStopplateService.getInstance().is_connected);
    }

    const test_buzzer = () => {
        beep(buzzerSoundFrequency, buzzerSoundWaveform, buzzerSoundDuration * 1000);

    }

    const AlwaysShow = () => <ButtonGroup fullWidth>
        <Button
            variant="contained"
            onClick={connect_to_ble_stopplate}
        >
            Connect
        </Button>
        <Button onClick={disconnect}>Disconnect</Button>
    </ButtonGroup>


    if (!isStopplateConnected) {
        return <AlwaysShow />
    }
    return (
        <>
            <Stack gap={2} divider={<Divider />}>
                <AlwaysShow />
                <Paper elevation={10} sx={{ padding: 1 }}>
                    <Stack gap={1}>
                        <SettingTagTypography>
                            stopplate indicator light up duration
                        </SettingTagTypography>
                        <Stack gap={2} direction="row">
                            <Input
                                value={stopplateIndicatorLightUpDuration}
                                size="small"
                                onChange={
                                    handleStopplateIndicatorLightUpDurationChange
                                }
                                inputProps={{
                                    step: 10,
                                    min: 0,
                                    max: 100,
                                    type: "number",
                                    "aria-labelledby": "input-slider",
                                }}
                                endAdornment={
                                    <InputAdornment position="start">
                                        s
                                    </InputAdornment>
                                }
                            />
                            <Slider
                                min={0}
                                max={30}
                                value={stopplateIndicatorLightUpDuration}
                                onChange={
                                    handleStopplateIndicatorLightUpDurationChange as unknown as (
                                        event: Event,
                                        value: number | number[],
                                        activeThumb: number
                                    ) => void
                                }
                            />
                        </Stack>
                    </Stack>
                </Paper>
                <Paper elevation={10} sx={{ padding: 1 }}>
                    <Stack gap={1}>
                        <SettingTagTypography>
                            Timer countdown time random range
                        </SettingTagTypography>
                        <Stack gap={0} direction="row">
                            <Input
                                value={timerCountdownRandomRange.min}
                                size="small"
                                onChange={(
                                    event: React.ChangeEvent<
                                        HTMLTextAreaElement | HTMLInputElement
                                    >
                                ) =>
                                    handleTimerCountdownRangeChange(event, true)
                                }
                                inputProps={{
                                    step: 1,
                                    min: 0,
                                    max: timerCountdownRandomRange.max,
                                    type: "number",
                                    "aria-labelledby": "input-slider",
                                }}
                                endAdornment={
                                    <InputAdornment position="start">
                                        s
                                    </InputAdornment>
                                }
                            />
                            <Slider
                                getAriaLabel={() => "Temperature"}
                                value={[
                                    timerCountdownRandomRange.min,
                                    timerCountdownRandomRange.max,
                                ]}
                                valueLabelDisplay="auto"
                                onChange={(event, values, avtiveThumb) => {
                                    values = values as number[];
                                    setTimerCountdownRandomRange({
                                        min: values[0],
                                        max: values[1],
                                    });
                                }}
                                min={0}
                                max={20}
                            />
                            <Input
                                endAdornment={
                                    <InputAdornment position="start">
                                        s
                                    </InputAdornment>
                                }
                                value={timerCountdownRandomRange.max}
                                size="small"
                                onChange={(
                                    event: React.ChangeEvent<
                                        HTMLTextAreaElement | HTMLInputElement
                                    >
                                ) =>
                                    handleTimerCountdownRangeChange(
                                        event,
                                        false
                                    )
                                }
                                inputProps={{
                                    step: 1,
                                    min: timerCountdownRandomRange.min,
                                    max: 20,
                                    type: "number",
                                    "aria-labelledby": "input-slider",
                                }}
                            />
                        </Stack>
                    </Stack>
                </Paper>
                <Paper elevation={10} sx={{ padding: 1 }}>
                    <Stack gap={1}>
                        <SettingTagTypography>
                            Buzzer (beep sound) duration
                        </SettingTagTypography>
                        <Stack gap={2} direction="row">
                            <Input
                                endAdornment={
                                    <InputAdornment position="start">
                                        s
                                    </InputAdornment>
                                }
                                value={buzzerSoundDuration}
                                size="small"
                                onChange={handleBuzzerSoundDurationChange}
                                inputProps={{
                                    step: 1,
                                    min: 0,
                                    max: 20,
                                    type: "number",
                                    "aria-labelledby": "input-slider",
                                }}
                            />
                            <Slider
                                min={0}
                                max={20}
                                value={buzzerSoundDuration}
                                // fucking typescript
                                onChange={
                                    handleBuzzerSoundDurationChange as unknown as (
                                        event: Event,
                                        value: number | number[],
                                        activeThumb: number
                                    ) => void
                                }
                            />
                        </Stack>
                    </Stack>
                </Paper>
                <Paper elevation={10} sx={{ padding: 1 }}>
                    <Stack gap={1}>
                        <SettingTagTypography>
                            Buzzer sound frequency
                        </SettingTagTypography>
                        <Stack gap={2} direction="row">
                            <Input
                                fullWidth
                                endAdornment={
                                    <InputAdornment position="start">
                                        Hz
                                    </InputAdornment>
                                }
                                value={buzzerSoundFrequency}
                                size="small"
                                onChange={handleBuzzerSoundFrequencyChange}
                                inputProps={{
                                    step: 1,
                                    min: 0,
                                    max: 8000,
                                    type: "number",
                                    "aria-labelledby": "input-slider",
                                }}
                            />
                            <Slider
                                min={0}
                                max={8000}
                                value={buzzerSoundFrequency}
                                onChange={
                                    handleBuzzerSoundFrequencyChange as unknown as (
                                        event: Event,
                                        value: number | number[],
                                        activeThumb: number
                                    ) => void
                                }
                            />
                        </Stack>
                    </Stack>
                </Paper>
                <Paper elevation={10} sx={{ padding: 1 }}>
                    <Stack gap={1}>
                        <SettingTagTypography>
                            Buzzer sound waveform
                        </SettingTagTypography>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                                Waveform
                            </InputLabel>
                            <Select
                                value={buzzerSoundWaveform}
                                label="Waveform"
                                onChange={handleBuzzerWaveformChange}
                            >
                                {BuzzerWaveformObject.map((v, i) => (
                                    <MenuItem key={i} value={v}>
                                        {v}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={test_buzzer}
                >
                    Test buzzer
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    onClick={apply_settings}
                >
                    Apply
                </Button>
            </Stack>
        </>
    );
}
