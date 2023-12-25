"use client";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import React from "react";
import { BuzzerWaveformObject, BuzzerWaveformType, beep } from "@/buzzer";
import { EROUTE_LIST, ROUTE_LIST } from "@/constant";
import Link from "next/link";
import { Delay } from "@/utils";
import { useRouter } from "next/navigation";
import { BLEStopplateService } from "@/ble_service";


const TimerOperatingButton = styled(Button)(({ theme }) => ({
    textAlign: "center",
    width: "100%",
    ...theme.typography.h5,
    padding: 20,
}));

const TimerTimeDisplayTypography = styled(Typography)(({ theme }) => ({
    ...theme.typography.h1,
    padding: 20,
    textAlign: "center",
    fontWeight: theme.typography.fontWeightBold,
}));
const TimerDetialInfoDisplayTypography = styled(Typography)(({ theme }) => ({
    ...theme.typography.subtitle2,
    textAlign: "center",
}));

const TimerHitRecordTypography = styled(Typography)(({ theme }) => ({
    ...theme.typography.h6,
    padding: "5px 10px 5px 10px",
}));

function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}


export default function () {
    const [displayTime, setDisplayTime] = React.useState<number>(0.0);
    const [timerOperatingButtonsDisable, setTimerOperatingButtonsDisable] =
        React.useState({
            menu: false,
            start: false,
            clear: false,
            review: false,
        });

    /**
     * call back when the countdown is finished
     */
    async function countdown() {
        var timer_countdown_break_flag = false;
        let settings = await BLEStopplateService.getInstance().get_settings();
        let countdown_second = randomInRange(settings.countdown_random_time_min, settings.countdown_random_time_max);
        let start_stamp = Date.now();
        window.addEventListener("countdown_break", () => {
            timer_countdown_break_flag = true;
        });
        setTimerOperatingButtonsDisable({
            ...timerOperatingButtonsDisable,
            menu: true,
            start: true,
        });
        while (
            Date.now() - start_stamp < countdown_second * 1000 &&
            !timer_countdown_break_flag
        ) {
            setDisplayTime(
                countdown_second - (Date.now() - start_stamp) * 0.001
            );
            await Delay(1);
        }
        window.removeEventListener("countdown_break", () => { });
        setTimerOperatingButtonsDisable({
            menu: false,
            start: false,
            clear: false,
            review: false,
        });
        if (!timer_countdown_break_flag) {
            setDisplayTime(0);
            beep(settings.buzzer_frequency, BuzzerWaveformObject[settings.buzzer_waveform], settings.buzzer_duration);
        }
    }
    function break_countdown() {
        window.dispatchEvent(new Event("countdown_break")); // or whatever the event type might be
    }
    const router = useRouter()

    function route_to_menu() {
        router.push(ROUTE_LIST[EROUTE_LIST.TimerMenu].dir);
    }

    return (
        <>
            <Stack
                spacing={2}
                divider={<Divider orientation="horizontal" flexItem />}
            >
                <Stack>
                    <TimerTimeDisplayTypography>
                        {displayTime.toFixed(2)}
                    </TimerTimeDisplayTypography>
                    <Stack direction={"row"} justifyContent={"space-evenly"}>
                        <TimerDetialInfoDisplayTypography>
                            Shot: 1/20
                        </TimerDetialInfoDisplayTypography>
                        <TimerDetialInfoDisplayTypography>
                            Time split: 1.22
                        </TimerDetialInfoDisplayTypography>
                    </Stack>
                </Stack>
                <Stack spacing={2}>
                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent={"space-evenly"}
                    >
                        <TimerOperatingButton
                            variant="outlined"
                            disabled={timerOperatingButtonsDisable.menu}
                            onClick={route_to_menu}
                        >
                            Menu
                        </TimerOperatingButton>
                        <TimerOperatingButton
                            variant="outlined"
                            disabled={timerOperatingButtonsDisable.start}
                            onClick={countdown}
                        >
                            Start
                        </TimerOperatingButton>
                    </Stack>
                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent={"space-evenly"}
                    >
                        <TimerOperatingButton
                            variant="outlined"
                            disabled={timerOperatingButtonsDisable.clear}
                            onClick={break_countdown}
                        >
                            Clear
                        </TimerOperatingButton>
                        <TimerOperatingButton
                            variant="outlined"
                            disabled={timerOperatingButtonsDisable.review}
                        >
                            Review
                        </TimerOperatingButton>
                    </Stack>
                </Stack>
                <Paper elevation={5}>
                    <Stack
                        divider={<Divider orientation="horizontal" flexItem />}
                    >
                        <TimerHitRecordTypography>
                            #1 00.00 - 00.10
                        </TimerHitRecordTypography>
                        <TimerHitRecordTypography>daw</TimerHitRecordTypography>
                        <TimerHitRecordTypography>daw</TimerHitRecordTypography>
                    </Stack>
                </Paper>
            </Stack>
        </>
    );
}
