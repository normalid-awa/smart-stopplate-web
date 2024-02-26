"use client";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import {
    Box,
    Button,
    ButtonGroup,
    ButtonProps,
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
    Tab,
    Tabs,
    Typography,
    TypographyProps,
    alpha,
    darken,
    gridClasses,
    lighten,
    styled,
    useTheme,
} from "@mui/material";
import { Query, Score, ScoreState } from "@/gql_dto";
import React from "react";
import {
    DataGrid,
    GridColDef,
    GridCsvExportMenuItem,
    GridCsvExportOptions,
    GridToolbarContainerProps,
    GridToolbarExportContainer,
    GridValueGetterParams,
    gridFilteredSortedRowIdsSelector,
    gridVisibleColumnFieldsSelector,
    useGridApiContext,
    useGridApiRef,
} from "@mui/x-data-grid";
import {
    ArrowDropDown,
    ArrowDropUp,
    Delete,
    Edit,
    PeopleOutlined,
    PersonAdd,
    Queue,
} from "@mui/icons-material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AddShooterDialog from "./addShooterDialog";
import { useRouter } from "next/navigation";
import { EROUTE_LIST, ROUTE_LIST } from "@/constant";
import {
    getBackgroundColor,
    getHoverBackgroundColor,
    getSelectedBackgroundColor,
    getSelectedHoverBackgroundColor,
} from "@/utils";
import { GridApi } from "@mui/x-data-grid-pro";
import { GridExportMenuItemProps } from "@mui/x-data-grid";
import { GridToolbarContainer } from "@mui/x-data-grid";
import ExcelJs from "exceljs";

const GET_SCORELIST_QUERY = gql`
    query GetScorelist($id: Int!) {
        getScorelist(id: $id) {
            createdAt
            id
            isLocked
            stage {
                name
            }
            rounds
            scores {
                round
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

const ADD_ROUND_MUTATION = gql`
    mutation AddNewRound($id:Int!){
        addNewRound(id: $id) {
            rounds
        }
    }
`;

const SUBSCRIBE_TO_SCORE_UPDATE = gql`
    subscription {
        subscribeToScoreUpdate
    }
`;
const SUBSCRIBE_TO_SCORELIST_UPDATE = gql`
    subscription {
        subscribeToScorelistUpdate
    }
`;

const DELETE_SCORE_MUTATION = gql`
    mutation DeleteScore($id: Int!) {
        deleteScore(id: $id) {
            id
        }
    }
`;
const SWAP_SCORE_MUTATION = gql`
    mutation SwapScoreId($id1: Int!, $id2: Int!) {
        swapScoreId(id1: $id1, id2: $id2)
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

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    "& .super-app-theme--DQ": {
        backgroundColor: getBackgroundColor(
            theme.palette.error.main,
            theme.palette.mode
        ),
        "&:hover": {
            backgroundColor: getHoverBackgroundColor(
                theme.palette.error.main,
                theme.palette.mode
            ),
        },
        "&.Mui-selected": {
            backgroundColor: getSelectedBackgroundColor(
                theme.palette.error.main,
                theme.palette.mode
            ),
            "&:hover": {
                backgroundColor: getSelectedHoverBackgroundColor(
                    theme.palette.error.main,
                    theme.palette.mode
                ),
            },
        },
    },
    "& .super-app-theme--SCORED": {
        backgroundColor: getBackgroundColor(
            theme.palette.success.main,
            theme.palette.mode
        ),
        "&:hover": {
            backgroundColor: getHoverBackgroundColor(
                theme.palette.success.main,
                theme.palette.mode
            ),
        },
        "&.Mui-selected": {
            backgroundColor: getSelectedBackgroundColor(
                theme.palette.success.main,
                theme.palette.mode
            ),
            "&:hover": {
                backgroundColor: getSelectedHoverBackgroundColor(
                    theme.palette.success.main,
                    theme.palette.mode
                ),
            },
        },
    },
    "& .super-app-theme--DNF": {
        backgroundColor: getBackgroundColor(
            theme.palette.warning.main,
            theme.palette.mode
        ),
        "&:hover": {
            backgroundColor: getHoverBackgroundColor(
                theme.palette.warning.main,
                theme.palette.mode
            ),
        },
        "&.Mui-selected": {
            backgroundColor: getSelectedBackgroundColor(
                theme.palette.warning.main,
                theme.palette.mode
            ),
            "&:hover": {
                backgroundColor: getSelectedHoverBackgroundColor(
                    theme.palette.warning.main,
                    theme.palette.mode
                ),
            },
        },
    },
}));
function JsonExportMenuItem(props: GridExportMenuItemProps<{}>) {
    const apiRef = useGridApiContext();

    const { hideMenu } = props;
    // Select rows and columns
    const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);

    // Format the data. Here we only keep the value
    let data: any[][] = [];
    filteredSortedRowIds.map((id) => {
        let row: any[] = [];
        visibleColumnsField.forEach((field, i) => {
            if (apiRef.current.getCellParams(id, field).field == "actions")
                return;
            row.push(apiRef.current.getCellParams(id, field).value ?? "");
        });
        data.push(row);
    });

    return (
        <MenuItem
            onClick={() => {
                const workbook = new ExcelJs.Workbook();
                const sheet = workbook.addWorksheet("Stage");
                sheet.addTable({
                    name: "table",
                    ref: "A1",
                    columns: [
                        { name: "ID" },
                        { name: "Shooter" },
                        { name: "A" },
                        { name: "C" },
                        { name: "D" },
                        { name: "Popper" },
                        { name: "Miss" },
                        { name: "No-shoot" },
                        { name: "Procedural Error" },
                        { name: "Total Score" },
                        { name: "Time" },
                        { name: "Hit-Factor" },
                        { name: "State" },
                    ],
                    rows: data,
                });
                workbook.xlsx.writeBuffer().then((content) => {
                    const link = document.createElement("a");
                    const blobData = new Blob([content], {
                        type: "application/vnd.ms-excel;charset=utf-8;",
                    });
                    let current_date = new Date();
                    link.download =
                        new Intl.DateTimeFormat("default", {
                            dateStyle: "full",
                            timeStyle: "full",
                            hour12: true,
                        }).format(current_date) + ".xlsx";
                    link.href = URL.createObjectURL(blobData);
                    link.click();
                });
                // const blob = new Blob([jsonString], {
                //     type: 'text/json',
                // });
                // exportBlob(blob, 'DataGrid_demo.json');

                // Hide the export menu after the export
                hideMenu?.();
            }}
        >
            Export excel
        </MenuItem>
    );
}

const csvOptions: GridCsvExportOptions = { delimiter: ";" };

function CustomExportButton(props: ButtonProps) {
    return (
        <GridToolbarExportContainer {...props}>
            <GridCsvExportMenuItem options={csvOptions} />
            <JsonExportMenuItem />
        </GridToolbarExportContainer>
    );
}
function CustomToolbar(props: GridToolbarContainerProps) {
    return (
        <GridToolbarContainer {...props}>
            <CustomExportButton />
        </GridToolbarContainer>
    );
}

export default function ScorelistPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const scorelist = useQuery<Query>(GET_SCORELIST_QUERY, {
        variables: { id },
    });
    useSubscription<Query>(SUBSCRIBE_TO_SCORE_UPDATE, {
        onData(options) {
            scorelist.refetch();
        },
    });
    useSubscription<Query>(SUBSCRIBE_TO_SCORELIST_UPDATE, {
        onData(options) {
            scorelist.refetch();
        },
    });

    const [delete_score, delete_score_info] = useMutation(
        DELETE_SCORE_MUTATION
    );
    const [swap_score, swap_score_info] = useMutation(SWAP_SCORE_MUTATION);
    const [add_round, add_round_info] = useMutation(ADD_ROUND_MUTATION);

    React.useEffect(() => {
        scorelist.refetch();
    }, []);

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
                disabled={scorelist.data?.getScorelist.isLocked}
            >
                <Delete />
            </IconButton>
        );
    };
    const SortingActionButton = (props: ActionButtonProps) => {
        return (
            <Stack direction="row">
                <IconButton
                    size="small"
                    onClick={() => {
                        let id =
                            scorelist.data?.getScorelist.scores.findIndex(
                                (v) => v.id == props.row.id
                            ) ?? -1;
                        if (id - 1 < 0) return;
                        swap_score({
                            variables: {
                                id1: props.row.id,
                                id2: scorelist.data?.getScorelist.scores[id - 1]
                                    .id,
                            },
                        });
                    }}
                    disabled={scorelist.data?.getScorelist.isLocked}
                >
                    <ArrowDropUp />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => {
                        let id =
                            scorelist.data?.getScorelist.scores.findIndex(
                                (v) => v.id == props.row.id
                            ) ?? -1;
                        if (
                            id + 1 >
                            (scorelist.data?.getScorelist.scores.length ?? 0) -
                            1
                        )
                            return;
                        swap_score({
                            variables: {
                                id1: props.row.id,
                                id2: scorelist.data?.getScorelist.scores[id + 1]
                                    .id,
                            },
                        });
                    }}
                    disabled={scorelist.data?.getScorelist.isLocked}
                >
                    <ArrowDropDown />
                </IconButton>
            </Stack>
            // <ButtonGroup orientation="vertical">
            //     <Button startIcon={<ArrowDropUp sx={{ p: 0, m: 0 }} />} sx={{ p: 0, m: 0 }}>Up</Button>
            //     <Button startIcon={<ArrowDropDown sx={{ p: 0, m: 0 }} />} sx={{ p: 0, m: 0 }} >Down</Button>
            // </ButtonGroup>
        );
    };
    const columns: GridColDef[] = [
        {
            field: "actions_sort",
            type: "actions",
            headerName: "",
            cellClassName: "actions",
            flex: 1,
            getActions: ({ id, row }) => {
                return [<SortingActionButton row={row} />];
            },
        },
        {
            field: "Name",
            valueGetter: (params) => {
                var result = params.row.shooter.name;
                if (params.row.scoreState === "DQ") result += "(DQ)";
                if (params.row.scoreState === "DNF") result += "(DNF)";
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
            field: "State",
            valueGetter: (params) => {
                let state: ScoreState = params.row.scoreState;
                switch (state) {
                    case ScoreState.Dnf:
                        return "DNF";
                    case ScoreState.Dq:
                        return "DQ";
                    case ScoreState.Scored:
                        return "Scored";
                    case ScoreState.HaveNotScoredYet:
                        return "Did not scored";
                }
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

    const [round, setRound] = React.useState(0);

    if (scorelist.loading) return <pre>Loading...</pre>;
    if (scorelist.error)
        return <pre>Error: {JSON.stringify(scorelist.error)}</pre>;
    if (!scorelist.data) return <pre>No Data</pre>;
    return (
        <>
            <h5>
                You are currently scoring stage:{" "}
                {scorelist.data.getScorelist.stage.name}
            </h5>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                        value={round}
                        onChange={(_, v) => setRound(v)}
                    >
                        {((
                            () => {
                                let tabs = [];
                                for (
                                    let index = 0;
                                    index < scorelist.data.getScorelist.rounds;
                                    index++
                                ) {
                                    tabs.push(<Tab label={`Round ${index + 1}`} />)
                                }
                                return tabs
                            })())}
                    </Tabs>
                </Box>
                {/* <CustomTabPanel value={value} index={0}>
                    Item One
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    Item Two
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    Item Three
                </CustomTabPanel> */}
                <Stack divider={<Divider />} gap={2}>
                    <StripedDataGrid
                        rows={scorelist.data.getScorelist.scores.filter(
                            (v) => v.round == round + 1
                        )}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 50,
                                },
                            },
                        }}
                        onCellClick={(v) => {
                            if (v.colDef.type == "actions") return;
                            router.push(
                                `${ROUTE_LIST[EROUTE_LIST.Scores].dir}/${v.row.id
                                }`
                            );
                        }}
                        pageSizeOptions={[5]}
                        slots={{ toolbar: CustomToolbar }}
                        disableRowSelectionOnClick
                        getRowClassName={(params) =>
                            `super-app-theme--${params.row.scoreState}`
                        }
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
                        onClick={() => {
                            add_round({
                                variables: {
                                    id: id
                                }
                            })
                        }}
                    />
                </StyledSpeedDial>
            </Box>
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    close_all_promt();
                }}
                fullWidth
                maxWidth="md"
            >
                {addShooterOpen ? (
                    <AddShooterDialog
                        onClose={() => {
                            setDialogOpen(false);
                            close_all_promt();
                        }}
                        round={round + 1}
                        scorelistId={id}
                    />
                ) : (
                    <></>
                )}
            </Dialog>
        </>
    );
}
