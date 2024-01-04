"use client";
import { Query, Stage } from "@/gql_dto";
import { useQuery, gql, useMutation, QueryResult, OperationVariables } from "@apollo/client";
import {
    Backdrop,
    Box,
    Button,
    Dialog,
    Divider,
    Fab,
    Grid,
    Grow,
    IconButton,
    Paper,
    Stack,
    Typography,
    styled,
} from "@mui/material";
import React from "react";
import {
    DataGrid,
    GridCallbackDetails,
    GridCellCheckboxForwardRef,
    GridCellParams,
    GridColDef,
    GridToolbar,
    MuiEvent,
    zhTW,
} from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";
import { Lock, Delete, Edit, Add } from "@mui/icons-material";
import StageInfoDialog from "./stageInfoDialog";
import CreateStageDialog from "./createStageDialog";
const GET_ALL_STAGES_QUERY = gql`
    query GetAllStages {
        getAllStages {
            id
            createdAt
            name
            description
            paperTargets
            noShoots
            popperTargets
            minimumRounds
            maximumPoints
            isLocked
            type
            condition
        }
    }
`;

const DELETE_STAGE_MUTATION = gql`
    mutation DeleteStage($ID: Int!) {
        deleteStage(id: $ID) {
            id
        }
    }
`;

const LOCK_STAGE_MUTATION = gql`
    mutation LockStage($ID: Int!) {
        lockStage(id: $ID) {
            id
        }
    }
`;

interface ActionButtonProps { row: Stage }
const DeleteActionButton = (props: ActionButtonProps) => {
    const [delete_stage, delete_stage_info] = useMutation(DELETE_STAGE_MUTATION);

    return <IconButton disabled={props.row.isLocked} onClick={() => {
        if (!confirm(`Are you sure you want to delete ${props.row.name}?`))
            return;

        delete_stage({
            variables: { ID: props.row.id }, onCompleted(data, clientOptions) {
                get_stage_ref.refetch();
            },
        });
    }}>
        <Delete />
    </IconButton>
}
const LockActionButton = (props: ActionButtonProps) => {
    const [lock_stage, lock_stage_info] = useMutation(LOCK_STAGE_MUTATION);

    return <IconButton disabled={props.row.isLocked} onClick={() => {
        if (!confirm(`Are you sure you want to lock ${props.row.name}?`))
            return;

        lock_stage({
            variables: { ID: props.row.id }, onCompleted(data, clientOptions) {
                get_stage_ref.refetch();
            },
        });
    }}>
        <Lock />
    </IconButton>
}
const EditActionButton = (props: ActionButtonProps) => {
    return <IconButton disabled={props.row.isLocked} onClick={() => {

    }}>
        <Edit />
    </IconButton>
}

const columns: GridColDef[] = [
    {
        field: "ID",
        valueGetter: (params) => {
            return params.row.id;
        },
        type: "number",
        align: "center",
        // width: 1,
        flex: 0.01,
    },
    {
        field: "Name",
        valueGetter: (params) => {
            return params.row.name;
        },
        minWidth: 200,
        flex: 1,
    },
    {
        field: "Created at",
        valueGetter: (params) => {
            return new Date(params.row.createdAt);
        },
        type: "dateTime",
        minWidth: 170,
        flex: 0.2,
    },
    {
        field: "Type",
        valueGetter: (params) => {
            let capitalized =
                params.row.type.charAt(0).toUpperCase()
                + params.row.type.slice(1)
            return capitalized;
        },
        type: "string",
        minWidth: 80,
        flex: 0.1,
    },
    {
        field: "Condition",
        valueGetter: (params) => {
            return "Condition " + params.row.condition;
        },
        type: "string",
        minWidth: 120,
        flex: 0.1,
    },
    {
        field: "Papers",
        valueGetter: (params) => {
            return params.row.paperTargets;
        },
        type: "number",
        width: 70,
    },
    {
        field: "No shoots",
        valueGetter: (params) => {
            return params.row.noShoots;
        },
        type: "number",
        width: 100,
    },
    {
        field: "Min. rounds",
        valueGetter: (params) => {
            return params.row.minimumRounds;
        },
        type: "number",
        width: 100,
    },
    {
        field: "Max. points",
        valueGetter: (params) => {
            return params.row.maximumPoints;
        },
        type: "number",
        width: 100,
    },
    {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 150,
        cellClassName: "actions",
        getActions: ({ id, row }) => {
            return [
                <DeleteActionButton row={row} />,
                <LockActionButton row={row} />,
                <EditActionButton row={row} />,
            ];
        },
    },
];
var get_stage_ref: QueryResult<Query, OperationVariables>;
export default function StagesPage() {
    const [stageInfoOpen, setStageInfoOpen] = React.useState(false);
    const [createStageOpen, setCreateStageOpen] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [stageInfoId, setStageInfoId] = React.useState(0);

    const all_stage_info = useQuery<Query>(GET_ALL_STAGES_QUERY);
    React.useEffect(() => {
        get_stage_ref = all_stage_info
    }, [])


    if (all_stage_info.loading) return "Loading...";
    if (all_stage_info.error) return <pre>{all_stage_info.error.message}</pre>;
    if (!all_stage_info.data) return <pre>no data</pre>;

    function close_all_windows() {
        setStageInfoOpen(false);
        setCreateStageOpen(false);
    }

    return (
        <>
            <Stack>
                <Typography sx={{ marginBottom: 2 }} variant="h5">Stages managemant</Typography>
                <Box sx={{ height: "100%", width: "100%" }}>
                    <DataGrid
                        localeText={
                            zhTW.components.MuiDataGrid.defaultProps.localeText
                        }
                        columns={columns}
                        rows={all_stage_info.data.getAllStages}
                        slots={{
                            toolbar: GridToolbar,
                        }}
                        onCellClick={(
                            params: GridCellParams<any>,
                            event: MuiEvent<React.MouseEvent<HTMLElement>>,
                            detail: GridCallbackDetails
                        ) => {
                            if (params.field == "actions")
                                return
                            console.log(params, event, detail);
                            setStageInfoId(params.row.id)
                            setStageInfoOpen(true);
                            setDialogOpen(true);
                        }}
                    />
                </Box>
            </Stack>
            <Dialog
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    close_all_windows();
                }}
                fullWidth
                maxWidth={"md"}
            >
                {stageInfoOpen ? <StageInfoDialog stage_id={stageInfoId} /> : <></>}
                {createStageOpen ? <CreateStageDialog onClose={() => {
                    setDialogOpen(false);
                    close_all_windows();
                }} /> : <></>}
            </Dialog>
            <Fab sx={{
                position: 'absolute',
                bottom: 50,
                right: 50,
            }}
                color="primary"
                onClick={() => {
                    setCreateStageOpen(true);
                    setDialogOpen(true);
                    get_stage_ref.refetch();
                }}
            >
                <Add />
            </Fab>
        </>
    );
}
