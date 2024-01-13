"use client";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import {
    Box,
    Button,
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
    Delete,
    Edit,
    PeopleOutlined,
    PersonAdd,
    Queue,
} from "@mui/icons-material";
import AddShooterDialog from "./addShooterDialog";
import { useRouter } from "next/navigation";
import { EROUTE_LIST, ROUTE_LIST } from "@/constant";
import { getBackgroundColor, getHoverBackgroundColor, getSelectedBackgroundColor, getSelectedHoverBackgroundColor } from "@/utils";
import { GridApi } from "@mui/x-data-grid-pro";
import { GridExportMenuItemProps } from "@mui/x-data-grid";
import { GridToolbarContainer } from "@mui/x-data-grid";
import ExcelJs from "exceljs"

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



const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .super-app-theme--DQ': {
        backgroundColor: getBackgroundColor(theme.palette.error.main, theme.palette.mode),
        '&:hover': {
            backgroundColor: getHoverBackgroundColor(
                theme.palette.error.main,
                theme.palette.mode,
            ),
        },
        '&.Mui-selected': {
            backgroundColor: getSelectedBackgroundColor(
                theme.palette.error.main,
                theme.palette.mode,
            ),
            '&:hover': {
                backgroundColor: getSelectedHoverBackgroundColor(
                    theme.palette.error.main,
                    theme.palette.mode,
                ),
            },
        },
    },
    '& .super-app-theme--SCORED': {
        backgroundColor: getBackgroundColor(
            theme.palette.success.main,
            theme.palette.mode,
        ),
        '&:hover': {
            backgroundColor: getHoverBackgroundColor(
                theme.palette.success.main,
                theme.palette.mode,
            ),
        },
        '&.Mui-selected': {
            backgroundColor: getSelectedBackgroundColor(
                theme.palette.success.main,
                theme.palette.mode,
            ),
            '&:hover': {
                backgroundColor: getSelectedHoverBackgroundColor(
                    theme.palette.success.main,
                    theme.palette.mode,
                ),
            },
        },
    },
    '& .super-app-theme--DNF': {
        backgroundColor: getBackgroundColor(
            theme.palette.warning.main,
            theme.palette.mode,
        ),
        '&:hover': {
            backgroundColor: getHoverBackgroundColor(
                theme.palette.warning.main,
                theme.palette.mode,
            ),
        },
        '&.Mui-selected': {
            backgroundColor: getSelectedBackgroundColor(
                theme.palette.warning.main,
                theme.palette.mode,
            ),
            '&:hover': {
                backgroundColor: getSelectedHoverBackgroundColor(
                    theme.palette.warning.main,
                    theme.palette.mode,
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
            console.log(apiRef.current.getCellParams(id, field))
            if (apiRef.current.getCellParams(id, field).field == "actions")
                return
            row.push(apiRef.current.getCellParams(id, field).value ?? "");
        });
        data.push(row);
    });

    return (
        <MenuItem
            onClick={() => {
                const workbook = new ExcelJs.Workbook();
                const sheet = workbook.addWorksheet('Stage');
                sheet.addTable({
                    name: 'table',
                    ref: 'A1',
                    columns: [{ name: 'ID' }, { name: 'Shooter' }, { name: 'A' }, { name: 'C' }, { name: 'D' }, { name: 'Popper' }, { name: 'Miss' }, { name: 'No-shoot' }, { name: 'Procedural Error' }, { name: 'Total Score' }, { name: 'Time' }, { name: 'Hit-Factor' }, { name: 'State' },],
                    rows: data,
                });
                workbook.xlsx.writeBuffer().then((content) => {
                    const link = document.createElement("a");
                    const blobData = new Blob([content], {
                        type: "application/vnd.ms-excel;charset=utf-8;"
                    });
                    let current_date = new Date();
                    link.download = new Intl.DateTimeFormat('default', {
                        dateStyle: 'full',
                        timeStyle: 'full',
                        hour12: true,

                    }).format(current_date) + '.xlsx';
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


const csvOptions: GridCsvExportOptions = { delimiter: ';' };

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
                disabled={scorelist.data?.getScorelist.isLocked}
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
                if (params.row.scoreState === "DQ")
                    result += "(DQ)"
                if (params.row.scoreState === "DNF")
                    result += "(DNF)"
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
                let state: ScoreState = params.row.scoreState
                switch (state) {
                    case ScoreState.Dnf:
                        return "DNF"
                    case ScoreState.Dq:
                        return "DQ"
                    case ScoreState.Scored:
                        return "Scored"
                    case ScoreState.HaveNotScoredYet:
                        return "Did not scored"
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
                <StripedDataGrid
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
                    slots={{ toolbar: CustomToolbar }}
                    disableRowSelectionOnClick
                    getRowClassName={(params) => `super-app-theme--${params.row.scoreState}`}
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
