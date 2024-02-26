"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { ProErrorListItem, Query, ScoreState } from "@/gql_dto";
import {
    Button,
    ButtonGroup,
    Container,
    Dialog,
    Divider,
    Grid,
    IconButton,
    Input,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    styled,
    useTheme,
} from "@mui/material";
import { Add, AvTimer, LockClock, Remove } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { GridColDef } from "@mui/x-data-grid";
import React from "react";
import { useLongPress } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import TimerPage from "@/app/timer/page";
import DQDialog from "./setDqDialog";
import ProErrorDialog from "./proErrorDialog";


const GET_SCORE_QUERY = gql`
    query GetScore($id: Int!) {
        getScore(id: $id) {
            id
            shooter {
                name
            }
            scoreState
            alphaZone
            charlieZone
            deltaZone
            poppers
            miss
            noShoots
            proError
            time
            scorelist {
                isLocked
                stage {
                    paperTargets
                    popperTargets
                }
            }
            proErrorRecord {
                id
                count
                proErrorItemId
            }
        }
    }
`;
const UPDATE_SCORE_MUTATION = gql`
    mutation UpdateScore(
        $id: Int!
        $alphaZone: Int!
        $charlieZone: Int!
        $deltaZone: Int!
        $noShoots: Int!
        $miss: Int!
        $poppers: Int!
        $proError: Int!
        $time: Float!
        $proList: [ProErrorListItem]!
    ) {
        updateScore(
            id: $id,
            alphaZone: $alphaZone
            charlieZone: $charlieZone
            deltaZone: $deltaZone
            noShoots: $noShoots
            miss: $miss
            poppers: $poppers
            proError: $proError
            time: $time
            proList: $proList
        ) {
            id
        }
    }
`;
const SET_SCORE_DQ = gql`
    mutation SetScoreDQ($id: Int!) {
        setScoreDQ(id: $id) {
            id
        }
    }
`;
const SET_SCORE_DNF = gql`
    mutation SetScoreDNF($id: Int!) {
        setScoreDNF(id: $id) {
            id
        }
    }
`;


const Item = styled(Paper)((theme) => ({
    padding: theme.theme.spacing(1),
}));

const StyledTableCell = styled(TableCell)((theme) => ({
    userSelect: "none",
    padding: 0,
    paddingTop: 5,
    paddingBottom: 5,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({}));

interface Column {
    id: string;
    label: string;
    maxWidth?: number;
}


interface PaperTargetData {
    id: number;
    a: number;
    c: number;
    d: number;
    m: number;
    ns: number;
}

export default function ScoringPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const score = useQuery<Query>(GET_SCORE_QUERY, {
        variables: {
            id,
        },
        onCompleted(data) {
            let pappers: PaperTargetData[] = [];
            for (
                let index = 0;
                index < data.getScore.scorelist.stage.paperTargets;
                index++
            ) {
                pappers.push({
                    id: index + 1,
                    a: 0,
                    c: 0,
                    d: 0,
                    m: 0,
                    ns: 0,
                });
            }
            if (data.getScore.scoreState == ScoreState.Scored) {
                let a = data.getScore.alphaZone;
                let c = data.getScore.charlieZone;
                let d = data.getScore.deltaZone;
                let m = data.getScore.miss;
                let ns = data.getScore.noShoots;
                let pp = data.getScore.poppers;
                let pe = data.getScore.proError;
                let time = data.getScore.time;
                pappers.forEach((v, i) => {
                    let added = 0;
                    if (a > 1) {
                        pappers[i].a = 2;
                        a -= 2;
                        added += 2;
                    } else if (c > 1) {
                        pappers[i].c = 2;
                        c -= 2;
                        added += 2;
                    } else if (d > 1) {
                        pappers[i].d = 2;
                        d -= 2;
                        added += 2;
                    } else if (m > 1) {
                        pappers[i].m = 2;
                        m -= 2;
                        added += 2;
                    }
                    if (added >= 2) return;
                    while (added < 2) {
                        if (a == 1) {
                            pappers[i].a = 1;
                            a -= 1;
                            added++;
                        } else if (c == 1) {
                            pappers[i].c = 1;
                            c -= 1;
                            added++;
                        } else if (d == 1) {
                            pappers[i].d = 1;
                            d -= 1;
                            added++;
                        } else if (m == 1) {
                            pappers[i].m = 1;
                            m -= 1;
                            added++;
                        }
                    }
                });
                pappers[0].ns = ns;
                setPopper(pp);
                // setPro(pe);
                setTime(time);
            }
            setPapperData(pappers);

            let __pro: typeof pro = []
            data.getScore.proErrorRecord?.forEach(v => {
                if (!v)
                    return
                __pro.push({
                    count: v?.count,
                    pro_id: v?.proErrorItemId,
                })
            })
            setPro(__pro)
            let p = 0
            pro.forEach(v => p += v.count)
            setProAmount(p);
        },
    });
    const [papperData, setPapperData] = React.useState<PaperTargetData[]>([]);
    const [update_score, update_score_] = useMutation(UPDATE_SCORE_MUTATION);
    const [set_dnf, set_dnf_] = useMutation(SET_SCORE_DNF);

    const [time, setTime] = React.useState(0);
    const [pro, setPro] = React.useState<ProErrorListItem[]>([]);
    const [proAmount, setProAmount] = React.useState<number>(0);
    const [popper, setPopper] = React.useState(0);

    const theme = useTheme();
    const router = useRouter();

    function submit_score() {
        var total_a: number = 0;
        var total_c: number = 0;
        var total_d: number = 0;
        var total_ns: number = 0;
        var total_m: number = 0;
        papperData.map((v) => {
            total_a += v.a;
            total_c += v.c;
            total_d += v.d;
            total_ns += v.ns;
            total_m += v.m;
        });
        if (!confirm("Are you sure you are finished marking?")) return;

        console.log(pro, proAmount)

        update_score({
            variables: {
                id: id,
                alphaZone: total_a,
                charlieZone: total_c,
                deltaZone: total_d,
                noShoots: total_ns,
                miss: total_m,
                poppers: popper,
                proError: proAmount,
                time: time,
                proList: pro,
            },
            onCompleted(data, clientOptions) {
                router.back();
            },
        });
    }

    const [timerPrompt, setTimerPrompt] = React.useState(false);
    function openTimer() {
        setTimerPrompt(true);
    }
    function onTimerAssign(time: number) {
        setTime(time)
        setTimerPrompt(false)
    }

    // #region
    const attrs = useLongPress(
        (event) => {
            let data = papperData.slice();
            let param: {
                id: number;
                zone: "id" /* this is fake, to cancell out the ts error :) */;
            } = JSON.parse(
                (event.target as unknown as { ariaLabel: string }).ariaLabel
            );
            data[param.id][param.zone] = 0;
            setPapperData(data);
        },
        {
            threshold: 1000,
        }
    );
    function on_cell_click(id: number, zone: string) {
        let ts_zone =
            zone as "id"; /* this is fake, to cancell out the ts error :) */
        let data = papperData.slice();
        if (data[id].a + data[id].c + data[id].d + data[id].m >= 2 && zone !== "ns") return;
        data[id][ts_zone] = data[id][ts_zone] + 1;
        setPapperData(data);
    }
    const columns: readonly Column[] = [
        { id: "a", label: "A", maxWidth: 5 },
        { id: "c", label: "C", maxWidth: 5 },
        {
            id: "d",
            label: "D",
            maxWidth: 5,
        },
        {
            id: "m",
            label: "M",
            maxWidth: 5,
        },
        {
            id: "ns",
            label: "NS",
            maxWidth: 5,
        },
    ];

    React.useEffect(() => {
        score.refetch();
    }, [])

    React.useEffect(() => {
        let p = 0
        pro.forEach(v => p += v.count)
        setProAmount(p);
    }, [pro])

    const [dqDialog, setDqDialog] = React.useState(false);
    const [proErrorDialog, setProErrorDialog] = React.useState(false);

    if (score.loading) return <pre>Loading...</pre>;
    if (score.error) return <pre>{JSON.stringify(score.error)}</pre>;
    if (!score.data) return <pre>No data</pre>;

    // #endregion
    return (
        <>
            <Container maxWidth={"sm"} sx={{ padding: 0 }}>
                <h1>{score.data.getScore.shooter.name} :</h1>
                <Paper elevation={10}>
                    <Grid container sx={{ padding: 1 }}>
                        <Grid item container xs={12} sm={6}>
                            <Grid item xs={5}>
                                <Stack
                                    alignItems={"center"}
                                    direction={"row"}
                                    height={"100%"}
                                >
                                    <p>Timer:</p>
                                </Stack>
                            </Grid>
                            <Grid xs={7} item>
                                <Stack alignItems={"center"} direction={"row"}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Time"
                                        value={time}
                                        onChange={(v) =>
                                            setTime(parseFloat(v.target.value))
                                        }
                                        inputProps={{
                                            step: 1,
                                            min: 0,
                                            type: "number",
                                            "aria-labelledby": "input-slider",
                                        }}
                                    />
                                    <IconButton children={<AvTimer />} onClick={openTimer} />
                                </Stack>
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} sm={6}>
                            <Grid item xs={5}>
                                <Stack
                                    alignItems={"center"}
                                    direction={"row"}
                                    height={"100%"}
                                >
                                    <p>Popper:</p>
                                </Stack>
                            </Grid>
                            <Grid item xs={7}>
                                <Stack alignItems={"center"} direction={"row"}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Popper"
                                        value={popper}
                                        onChange={(v) =>
                                            setPopper(parseFloat(v.target.value))
                                        }
                                        inputProps={{
                                            step: 1,
                                            min: 0,
                                            max: score.data.getScore.scorelist.stage
                                                .popperTargets,
                                            type: "number",
                                            "aria-labelledby": "input-slider",
                                        }}
                                    />
                                    <Stack>
                                        <IconButton
                                            onClick={() =>
                                                setPopper(
                                                    popper +
                                                    (popper <
                                                        (score.data?.getScore
                                                            .scorelist.stage
                                                            ?.popperTargets ?? 0)
                                                        ? 1
                                                        : 0)
                                                )
                                            }
                                        >
                                            <Add />
                                        </IconButton>
                                        <IconButton
                                            onClick={() =>
                                                setPopper(
                                                    popper - (popper > 0 ? 1 : 0)
                                                )
                                            }
                                        >
                                            <Remove />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} sm={12}>
                            <Grid item xs={12}>
                                <Stack
                                    alignItems={"center"}
                                    direction={"row"}
                                    height={"100%"}
                                >
                                    <Button fullWidth variant="outlined" onClick={() => {
                                        setProErrorDialog(true)
                                        console.log(pro)
                                    }}>Pro Errors ({proAmount})</Button>
                                </Stack>
                            </Grid>
                            {/* <Grid item xs={7}>
                                <Stack alignItems={"center"} direction={"row"}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Pro error"
                                        value={pro}
                                        onChange={(v) =>
                                            setPro(parseFloat(v.target.value))
                                        }
                                        inputProps={{
                                            step: 1,
                                            min: 0,
                                            type: "number",
                                            "aria-labelledby": "input-slider",
                                        }}
                                    />
                                    <Stack>
                                        <IconButton onClick={() => setPro(pro + 1)}>
                                            <Add />
                                        </IconButton>
                                        <IconButton
                                            onClick={() =>
                                                setPro(pro - (pro > 0 ? 1 : 0))
                                            }
                                        >
                                            <Remove />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Grid> */}
                        </Grid>
                    </Grid>
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column.id} align="center">
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {papperData.map((row, i) => (
                                    <StyledTableRow
                                        key={i}
                                        sx={{
                                            "&:last-child td, &:last-child th": {
                                                border: 0,
                                            },
                                            background: `${row.a + row.c + row.d + row.m == 2
                                                ? theme.palette.success.dark
                                                : "inherit"
                                                }`,
                                        }}
                                    >
                                        <StyledTableCell>
                                            <Button
                                                style={{ minWidth: "1px" }}
                                                fullWidth
                                                onClick={() =>
                                                    on_cell_click(i, "a")
                                                }
                                                {...attrs}
                                                aria-label={JSON.stringify({
                                                    id: i,
                                                    zone: "a",
                                                })}
                                            >
                                                {row.a}
                                            </Button>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Button
                                                style={{ minWidth: "1px" }}
                                                fullWidth
                                                onClick={() =>
                                                    on_cell_click(i, "c")
                                                }
                                                {...attrs}
                                                aria-label={JSON.stringify({
                                                    id: i,
                                                    zone: "c",
                                                })}
                                            >
                                                {row.c}
                                            </Button>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Button
                                                style={{ minWidth: "1px" }}
                                                fullWidth
                                                onClick={() =>
                                                    on_cell_click(i, "d")
                                                }
                                                {...attrs}
                                                aria-label={JSON.stringify({
                                                    id: i,
                                                    zone: "d",
                                                })}
                                            >
                                                {row.d}
                                            </Button>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Button
                                                style={{ minWidth: "1px" }}
                                                fullWidth
                                                onClick={() =>
                                                    on_cell_click(i, "m")
                                                }
                                                {...attrs}
                                                aria-label={JSON.stringify({
                                                    id: i,
                                                    zone: "m",
                                                })}
                                            >
                                                {row.m}
                                            </Button>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Button
                                                style={{ minWidth: "1px" }}
                                                fullWidth
                                                onClick={() =>
                                                    on_cell_click(i, "ns")
                                                }
                                                {...attrs}
                                                aria-label={JSON.stringify({
                                                    id: i,
                                                    zone: "ns",
                                                })}
                                            >
                                                {row.ns}
                                            </Button>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Divider sx={{ padding: 1 }} />
                    {score.data.getScore.scorelist.isLocked ? (
                        <p>This score has been locked</p>
                    ) :
                        <Grid container>
                            <Grid item xs={12 / 3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    onClick={() => setDqDialog(true)}
                                >
                                    DQ
                                </Button>
                            </Grid>
                            <Grid item xs={12 / 3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="warning"
                                    onClick={() => {
                                        if (
                                            !confirm(
                                                "Are you sure you wanna DNF(Did not finish) this shooter?"
                                            )
                                        )
                                            return;
                                        set_dnf({
                                            variables: { id },
                                            onCompleted(data, clientOptions) {
                                                alert("DNFed");
                                                router.back();
                                            },
                                            onError(error, clientOptions) {
                                                alert(
                                                    "Fail to DNF due to server error"
                                                );
                                            },
                                        });
                                    }}
                                >
                                    DNF
                                </Button>
                            </Grid>
                            {score.data.getScore.scoreState === ScoreState.Scored ? (
                                <Grid item xs={12 / 3}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        onClick={submit_score}
                                    >
                                        Update
                                    </Button>
                                </Grid>
                            ) :
                                <Grid item xs={12 / 3}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        onClick={submit_score}
                                    >
                                        Review
                                    </Button>
                                </Grid>}
                        </Grid>
                    }
                </Paper>
            </Container>
            <Dialog open={timerPrompt} onClose={() => setTimerPrompt(false)}>
                <TimerPage onAssign={onTimerAssign} />
            </Dialog>

            <Dialog open={dqDialog || proErrorDialog} onClose={() => {
                setDqDialog(false)
                setProErrorDialog(false);
            }} fullWidth maxWidth="md">
                {dqDialog ? <DQDialog onClose={() => {
                    setDqDialog(false)
                }} scoreId={score.data.getScore.id} /> : <></>}
                {proErrorDialog ? <ProErrorDialog
                    onClose={() => {
                        setProErrorDialog(false)
                    }}
                    value={pro}
                    onChange={setPro}
                /> : <></>}
            </Dialog>
        </>
    );
}
