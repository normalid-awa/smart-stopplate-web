"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { Query } from "@/gql_dto";
import {
    Button,
    ButtonGroup,
    Container,
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

const GET_SCORE_QUERY = gql`
    query GetScore($id: Int!) {
        getScore(id: $id) {
            id
            shooter {
                name
            }
            scorelist {
                stage {
                    paperTargets
                    popperTargets
                }
            }
        }
    }
`;

const ASSIGN_SCORE_MUTATION = gql`
    mutation AssignScore(
        $id: Int!
        $alphaZone: Int!
        $charlieZone: Int!
        $deltaZone: Int!
        $noShoots: Int!
        $miss: Int!
        $poppers: Int!
        $proError: Int!
        $time: Float!
    ) {
        assignScore(
            id: $id,
            alphaZone: $alphaZone
            charlieZone: $charlieZone
            deltaZone: $deltaZone
            noShoots: $noShoots
            miss: $miss
            poppers: $poppers
            proError: $proError
            time: $time
        ) {
            id
        }
    }
`
const SET_SCORE_DQ = gql`
    mutation SetScoreDQ(
        $id: Int!
    ) {
        setScoreDQ(
            id: $id,
        ) {
            id
        }
    }
`
const SET_SCORE_DNF = gql`
    mutation SetScoreDNF(
        $id: Int!
    ) {
        setScoreDNF(
            id: $id,
        ) {
            id
        }
    }
`
const Item = styled(Paper)((theme) => ({
    padding: theme.theme.spacing(1),
}));

const StyledTableCell = styled(TableCell)((theme) => ({
    userSelect: "none",
    padding: 0,
    paddingTop: 5,
    paddingBottom: 5,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({

}));

interface Column {
    id: string;
    label: string;
    maxWidth?: number;
}

export default function ScoringPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const score = useQuery<Query>(GET_SCORE_QUERY, {
        variables: {
            id,
        },
    });
    const [papperData, setPapperData] = React.useState<
        {
            id: number;
            a: number;
            c: number;
            d: number;
            m: number;
            ns: number;
        }[]
    >([]);
    const [assign_score, assign_score_] = useMutation(ASSIGN_SCORE_MUTATION)
    const [set_dq, set_dq_] = useMutation(SET_SCORE_DQ)
    const [set_dnf, set_dnf_] = useMutation(SET_SCORE_DNF)

    const [time, setTime] = React.useState(0);
    const [pro, setPro] = React.useState(0);
    const [popper, setPopper] = React.useState(0);

    const theme = useTheme()
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
        })
        if (!confirm("Are you sure you are finished marking?"))
            return

        assign_score({
            variables: {
                id: id,
                alphaZone: total_a,
                charlieZone: total_c,
                deltaZone: total_d,
                noShoots: total_ns,
                miss: total_m,
                poppers: popper,
                proError: pro,
                time: time
            },
            onCompleted(data, clientOptions) {
                router.back();
            },
        });
    }

    // #region  
    const attrs = useLongPress(
        (event) => {
            console.log(event);
            let data = papperData.slice();
            let param: { id: number, zone: "id" /* this is fake, to cancell out the ts error :) */ } = JSON.parse((event.target as unknown as { ariaLabel: string }).ariaLabel)
            data[param.id][param.zone] = 0;
            setPapperData(data);
        },
        {
            threshold: 500,
        }
    );
    function on_cell_click(id: number, zone: string) {
        let ts_zone = zone as "id";/* this is fake, to cancell out the ts error :) */
        let data = papperData.slice();
        if (data[id].a + data[id].c + data[id].d + data[id].m >= 2)
            return
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
        if (!score.data) return;
        let pappers = [];
        for (
            let index = 0;
            index < score.data.getScore.scorelist.stage.paperTargets;
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
        setPapperData(pappers);
    }, [score]);

    if (score.loading) return <pre>Loading...</pre>;
    if (score.error) return <pre>{JSON.stringify(score.error)}</pre>;
    if (!score.data) return <pre>No data</pre>;
    // #endregion
    return (
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
                                    onChange={(v) => setTime(parseFloat(v.target.value))}
                                    inputProps={{
                                        step: 1,
                                        min: 0,
                                        type: "number",
                                        "aria-labelledby": "input-slider",
                                    }}
                                />
                                <IconButton children={<AvTimer />} />
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
                                <p>Pro error:</p>
                            </Stack>
                        </Grid>
                        <Grid item xs={7}>
                            <Stack alignItems={"center"} direction={"row"}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Pro error"
                                    value={pro}
                                    onChange={(v) => setPro(parseFloat(v.target.value))}
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
                                    <IconButton onClick={() => setPro(pro - (pro > 0 ? 1 : 0))}>
                                        <Remove />
                                    </IconButton>
                                </Stack>
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
                                    onChange={(v) => setPopper(parseFloat(v.target.value))}
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
                                    <IconButton onClick={() => setPopper(popper + (popper < score.data?.getScore.scorelist.stage.popperTargets ? 1 : 0))}>
                                        <Add />
                                    </IconButton>
                                    <IconButton onClick={() => setPopper(popper - (popper > 0 ? 1 : 0))} >
                                        <Remove />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>
                <TableContainer component={Paper}>
                    <Table stickyHeader aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.id}>
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
                                        background: `${(row.a + row.c + row.d + row.m == 2) ? theme.palette.success.dark : "inherit"}`,
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
                                            aria-label={JSON.stringify({ id: i, zone: "a" })}
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
                                            aria-label={JSON.stringify({ id: i, zone: "c" })}
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
                                            aria-label={JSON.stringify({ id: i, zone: "d" })}
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
                                            aria-label={JSON.stringify({ id: i, zone: "m" })}
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
                                            aria-label={JSON.stringify({ id: i, zone: "ns" })}
                                        >
                                            {row.ns}
                                        </Button>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Divider sx={{ padding: 2 }} />
                <Grid container>
                    <Grid item xs={12 / 3}>
                        <Button fullWidth variant="contained" color="error" onClick={() => {
                            if (!confirm("Are you sure you wanna dq(disqualified) this shooter?"))
                                return
                            let v = prompt("Let CRO/RO to type DQ to process dq(disqualified) action")?.toLocaleUpperCase()
                            if (v != "DQ") {
                                alert("Action cancelled")
                                return
                            }
                            set_dq({
                                variables: { id }, onCompleted(data, clientOptions) {
                                    alert("DQed")
                                    router.back()
                                }, onError(error, clientOptions) {
                                    alert("Fail to DQ due to server error")
                                },
                            });
                        }}>DQ</Button>
                    </Grid>
                    <Grid item xs={12 / 3}>
                        <Button fullWidth variant="contained" color="warning">DNF</Button>
                    </Grid>
                    <Grid item xs={12 / 3}>
                        <Button fullWidth variant="contained" color="success" onClick={submit_score}>Review</Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
