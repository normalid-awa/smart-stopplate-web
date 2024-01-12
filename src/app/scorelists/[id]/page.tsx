"use client";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import {
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    PaperProps,
    Select,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Stack,
    Typography,
    TypographyProps,
    styled,
    useTheme,
} from "@mui/material";
import { Query, Score } from "@/gql_dto";
import React from "react";
import {
    DataGrid,
    GridColDef,
    GridValueGetterParams,
    useGridApiRef,
} from "@mui/x-data-grid";
import {
    Delete,
    Edit,
    PeopleOutlined,
    PersonAdd,
    Queue,
} from "@mui/icons-material";
import AddShooterDialog from "./addShooterDialog";
import { useRouter } from "next/navigation";
import { EROUTE_LIST, ROUTE_LIST } from "@/constant";

const GET_SCORELIST_QUERY = gql`
    query GetScorelist($id: Int!) {
        getScorelist(id: $id) {
            createdAt
            id
            isLocked
            stage {
                name
            }
            scores {
                id
                createdAt
                alphaZone
                charlieZone
                deltaZone
                noShoots
                miss
                poppers
                proError
                totalScore
                time
                hitFactor
                scoreState
                shooter {
                    name
                }
            }
        }
    }
`;

const SUBSCRIBE_TO_SCORE_UPDATE = gql`
    subscription {
        subscribeToScoreUpdate
    }
`;
const DELETE_SCORE_MUTATION = gql`
    mutation DeleteScore($id: Int!) {
        deleteScore(id: $id) {
            id
        }
    }
`;

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: "absolute",
    "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
    "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {
        top: theme.spacing(2),
        left: theme.spacing(2),
    },
}));

export default function ScorelistPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const scorelist = useQuery<Query>(GET_SCORELIST_QUERY, {
        variables: { id },
    });
    const _ = useSubscription<Query>(SUBSCRIBE_TO_SCORE_UPDATE, {
        onData(options) {
            scorelist.refetch();
        },
    });
    const [delete_score, delete_score_info] = useMutation(
        DELETE_SCORE_MUTATION
    );

    React.useEffect(() => {
        scorelist.refetch()
    }, [])

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [addShooterOpen, setAddShooterOpen] = React.useState(false);

    const theme = useTheme();
    const router = useRouter();

    // #region collumn def
    interface ActionButtonProps {
        row: Score;
    }
    const DeleteActionButton = (props: ActionButtonProps) => {
        return (
            <IconButton
                onClick={() => {
                    if (!confirm("Are you sure you want to delete this score?"))
                        return;
                    delete_score({
                        variables: {
                            id: props.row.id,
                        },
                    });
                }}
            >
                <Delete />
            </IconButton>
        );
    };
    const columns: GridColDef[] = [
        {
            field: "ID",
            valueGetter: (params) => {
                return params.row.id;
            },
            type: "number",
            maxWidth: 1,
            flex: 0.01,
        },
        {
            field: "Name",
            valueGetter: (params) => {
                var result = params.row.shooter.name
                console.log(params)
                if (params.row.scoreState === "DQ") 
                    result += "(DQ)"
                return result;
            },
            type: "string",
            flex: 5,
            minWidth: parseInt(theme.spacing(11)),
        },
        {
            field: "A",
            valueGetter: (params) => {
                return params.row.alphaZone;
            },
            type: "number",
            flex: 1,
        },
        {
            field: "C",
            valueGetter: (params) => {
                return params.row.charlieZone;
            },
            type: "number",
            flex: 1,
        },
        {
            field: "D",
            valueGetter: (params) => {
                return params.row.deltaZone;
            },
            type: "number",
            flex: 1,
        },
        {
            field: "Popper",
            valueGetter: (params) => {
                return params.row.poppers;
            },
            type: "number",
            flex: 1.2,
        },
        {
            field: "Miss",
            valueGetter: (params) => {
                return params.row.miss;
            },
            type: "number",
            flex: 1,
        },
        {
            field: "No-shoot",
            valueGetter: (params) => {
                return params.row.noShoots;
            },
            type: "number",
            flex: 1.2,
        },
        {
            field: "Pro-error",
            valueGetter: (params) => {
                return params.row.proError;
            },
            type: "number",
            flex: 1.2,
        },
        {
            field: "Total score",
            valueGetter: (params) => {
                return params.row.totalScore;
            },
            type: "number",
            flex: 1.2,
        },
        {
            field: "Time",
            valueGetter: (params) => {
                return params.row.time;
            },
            type: "number",
            flex: 1,
        },
        {
            field: "Hit Factor",
            valueGetter: (params) => {
                return (params.row.hitFactor as number).toFixed(3);
            },
            type: "number",
            flex: 2,
            minWidth: parseInt(theme.spacing(11)),
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            cellClassName: "actions",
            flex: 1,
            getActions: ({ id, row }) => {
                return [<DeleteActionButton row={row} />];
            },
        },
    ];
    // #endregion

    function close_all_promt() {
        setAddShooterOpen(false);
    }

    if (scorelist.loading) return <pre>Loading...</pre>;
    if (scorelist.error)
        return <pre>Error: {JSON.stringify(scorelist.error)}</pre>;
    if (!scorelist.data) return <pre>No Data</pre>;
    return (
        <>
            <Stack divider={<Divider />} gap={2}>
                <h5>
                    You are currently scoring stage:{" "}
                    {scorelist.data.getScorelist.stage.name}
                </h5>
                <DataGrid
                    rows={scorelist.data.getScorelist.scores}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 50,
                            },
                        },
                    }}
                    onCellClick={(v) => {
                        if (v.colDef.type == "actions")
                            return
                        router.push(`${ROUTE_LIST[EROUTE_LIST.Scores].dir}/${v.row.id}`)
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                />
            </Stack>
            <StyledSpeedDial
                ariaLabel="SpeedDial playground example"
                icon={<SpeedDialIcon />}
                direction={"up"}
            >
                <SpeedDialAction
                    icon={<PersonAdd />}
                    tooltipOpen
                    tooltipTitle={"Add shooter"}
                    onClick={() => {
                        setDialogOpen(true);
                        setAddShooterOpen(true);
                    }}
                />
                <SpeedDialAction
                    icon={<Queue />}
                    tooltipOpen
                    tooltipTitle={"Add round"}
                />
            </StyledSpeedDial>
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    close_all_promt();
                }}
            >
                {addShooterOpen ? (
                    <AddShooterDialog
                        onClose={() => {
                            setDialogOpen(false);
                            close_all_promt();
                        }}
                        scorelistId={id}
                    />
                ) : (
                    <></>
                )}
            </Dialog>
        </>
    );
}
