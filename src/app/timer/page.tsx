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
import { BLEStopplateService, HitCallback, HitCallbackID } from "@/ble_service";

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

interface HitHistory {
    time: number;
    diff: number;
    shots: number;
}

var GLOBAL_CALLBACK_ID: HitCallbackID;

interface TimerProps {
    onAssign?: (final_time: number) => void;
}

export default function TimerPage(props: TimerProps) {
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
        if (!BLEStopplateService.getInstance().checkConnectionState()) {
            alert("Connection lost, please reconnect the stopplate");
            return;
        }
        var timer_countdown_break_flag = false;
        let settings = await BLEStopplateService.getInstance().get_settings();
        let countdown_second = randomInRange(
            settings.countdown_random_time_min,
            settings.countdown_random_time_max
        );
        let start_stamp = Date.now();
        window.addEventListener("countdown_break", () => {
            timer_countdown_break_flag = true;
        });
        setTimerOperatingButtonsDisable({
            ...timerOperatingButtonsDisable,
            menu: true,
            start: true,
        });
        // await BLEStopplateService.getInstance().perform_time_sync();
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
            setTimerOperatingButtonsDisable({
                menu: true,
                start: true,
                clear: true,
                review: false,
            });
            setDisplayTime(0);

            beep(
                settings.buzzer_frequency,
                BuzzerWaveformObject[settings.buzzer_waveform],
                settings.buzzer_duration * 1000
            );
            GLOBAL_CALLBACK_ID =
                BLEStopplateService.getInstance().register_hit_callback(hit_cb);
            BLEStopplateService.getInstance().start_timer();
        }
    }
    function break_countdown() {
        window.dispatchEvent(new Event("countdown_break")); // or whatever the event type might be
    }
    const router = useRouter();

    function route_to_menu() {
        router.push(ROUTE_LIST[EROUTE_LIST.TimerMenu].dir);
    }

    function clear_button_handler() {
        break_countdown();
        setTimerOperatingButtonsDisable({
            menu: false,
            start: false,
            clear: false,
            review: false,
        });
        BLEStopplateService.getInstance().remove_hit_callback(
            GLOBAL_CALLBACK_ID
        );
        setHitStampList([]);
        setCurrentViewingIndex(0);
        setDisplayTime(0);
    }

    function review_button_handler() {
        let is_first_review;
        if (timerOperatingButtonsDisable.menu == false &&
            timerOperatingButtonsDisable.start == false &&
            timerOperatingButtonsDisable.clear == false &&
            timerOperatingButtonsDisable.review == false)
            is_first_review = false;
        else
            is_first_review = true;
        break_countdown();
        setTimerOperatingButtonsDisable({
            menu: false,
            start: false,
            clear: false,
            review: false,
        });
        BLEStopplateService.getInstance().remove_hit_callback(
            GLOBAL_CALLBACK_ID
        );
        if (hitStampList.length > 0) {
            let new_index;
            if (is_first_review)
                new_index = 0;
            else
                new_index = (currentViewingIndex + 1) % (hitStampList.length);
            setCurrentViewingIndex(new_index);
            setDisplayTime(hitStampList[new_index].time);
        }
    }

    const [hitStampList, setHitStampList] = React.useState<HitHistory[]>([]);
    const [currentViewingIndex, setCurrentViewingIndex] =
        React.useState<number>(0);

    const hit_cb: HitCallback = (_, stamp) => {
        console.log(stamp);
        var new_list = hitStampList;
        console.log("currnet list", new_list);
        let time = parseFloat(stamp);
        let diff;
        if (new_list.length == 0)
            diff = 0;
        else
            diff = time - new_list[0].time;
        new_list.unshift({
            time: time,
            diff: diff,
            shots: new_list.length + 1
        });
        setHitStampList(new_list);
        setCurrentViewingIndex(0);
        setDisplayTime(time);
    };


    const stick_activation_handler = (event: BeforeUnloadEvent) => {
        // Cancel the event as stated by the standard.
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = "Sure?";
    }

    React.useEffect(() => {
        const handleBeforeUnload = (event: Event) => {
            // Perform actions before the component unloads
            event.preventDefault();
            event.returnValue = true;
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const assign_button_handler = () => {
        if (props?.onAssign)
            props.onAssign((hitStampList[currentViewingIndex]?.time || 0));
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
                            Shot: {(hitStampList[currentViewingIndex]?.shots || 0)} / {hitStampList.length}
                        </TimerDetialInfoDisplayTypography>
                        <TimerDetialInfoDisplayTypography>
                            Time split: {(() => {
                                return (hitStampList[currentViewingIndex]?.diff || 0).toFixed(2);
                            })()}
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
                            onClick={clear_button_handler}
                        >
                            Clear
                        </TimerOperatingButton>
                        <TimerOperatingButton
                            variant="outlined"
                            disabled={timerOperatingButtonsDisable.review}
                            onClick={review_button_handler}
                        >
                            Review
                        </TimerOperatingButton>
                    </Stack>
                    {props.onAssign ?
                        <TimerOperatingButton
                            variant="contained"
                            onClick={assign_button_handler}
                        >
                            Assign
                        </TimerOperatingButton> : <></>
                    }
                </Stack>
                <Paper elevation={5}>
                    <Stack
                        divider={<Divider orientation="horizontal" flexItem />}
                    >
                        {hitStampList.map((hit, i) => {
                            return (
                                <TimerHitRecordTypography key={i}>
                                    #{hit.shots} {hit.time.toFixed(2)}{"-"}
                                    {hit.diff.toFixed(2)}
                                </TimerHitRecordTypography>
                            );
                        })}
                    </Stack>
                </Paper>
            </Stack>
        </>
    );
}
