"use client";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Box, Dialog, Fab, IconButton, Stack, Typography } from "@mui/material";
import {
    DataGrid,
    GridCallbackDetails,
    GridCellParams,
    GridColDef,
    GridToolbar,
    MuiEvent,
    zhTW,
} from "@mui/x-data-grid";
import React from "react";
import { useDemoData } from "@mui/x-data-grid-generator";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Query, Shooter } from "@/gql_dto";
import CreateShooterDialog from "./createShooterDialog";

const GET_ALL_SHOOTERS_QUERY = gql`
    query {
        getAllShooters {
            createdAt
            division
            id
            name
        }
    }
`;
const DELETE_SHOOTER_MUTATION = gql`
    mutation DeleteShooter($id:Int!) {
        deleteShooter(id:$id) {
            createdAt
            division
            id
            name
        }
    }
`;

const SHOOTER_UPDATE_SUBSCRIPTION = gql`
    subscription {
        subscribeToShooterUpdate
    }
`;

interface ActionButtonProps {
    row: Shooter;
}

export default function ShootersPage() {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const get_all_shooters = useQuery<Query>(GET_ALL_SHOOTERS_QUERY);
    const [delete_shooter, delete_shooter_info] = useMutation(DELETE_SHOOTER_MUTATION);
    
    const shooters_subscriptions = useSubscription(
        SHOOTER_UPDATE_SUBSCRIPTION,
        {
            onData({ data }) {
                console.log(data.data?.subscribeToShooterUpdate);
                get_all_shooters.refetch();
            },
            onError: (err) => console.log("error", err),
            shouldResubscribe: false,
        }
    );


    const [createShooterPopupOpen, setCreateShooterPopupOpen] =
        React.useState(false);
    const [editShooter, setEditShooter] = React.useState<Shooter | undefined>();

    function close_all_popups() {
        setCreateShooterPopupOpen(false);
    }

    const EditActionButton = (props: ActionButtonProps) => {
        return (
            <IconButton
                onClick={() => {
                    let index = get_all_shooters.data?.getAllShooters.findIndex((v) => v?.id === props.row.id)
                    setEditShooter(get_all_shooters.data?.getAllShooters[index as number] as React.SetStateAction<Shooter | undefined>);
                    setDialogOpen(true);
                    setCreateShooterPopupOpen(true);
                }}
            >
                <Edit />
            </IconButton>
        );
    };
    const DeleteActionButton = (props: ActionButtonProps) => {
        return (
            <IconButton
                onClick={() => {
                    if (!confirm(`Are you sure you want to delete ${props.row.name} ?`))
                        return
                    if (prompt(`Type shooter name (${props.row.name}) to excute the delete action`) !== props.row.name) {
                        alert("Aborting")
                        return
                    }
                    delete_shooter({
                        variables: {
                            id: props.row.id
                        },
                        onError(error, clientOptions) {
                            alert("Error when deleting shooter")
                            alert("Error code: " + JSON.stringify(error))
                        },
                    })
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
            maxWidth: 50,
            flex: 0.01,
        },
        {
            field: "Name",
            valueGetter: (params) => {
                return params.row.name;
            },
            type: "string",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "Division",
            valueGetter: (params) => {
                let normalized_cap =
                    params.row.division.charAt(0) +
                    params.row.division.slice(1).toLowerCase();
                return normalized_cap;
            },
            type: "string",
            minWidth: 100,
            flex: 0.2,
        },
        {
            field: "Created At",
            valueGetter: (params) => {
                return new Date(params.row.createdAt);
            },
            type: "dateTime",
            minWidth: 170,
            flex: 0.2,
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            width: 100,
            cellClassName: "actions",
            getActions: ({ id, row }) => {
                return [<EditActionButton row={row} />, <DeleteActionButton row={row} />];
            },
        },
    ];

    if (get_all_shooters.error)
        return <pre>{JSON.stringify(get_all_shooters.error)}</pre>;
    if (get_all_shooters.loading) return <pre>Loading...</pre>;
    if (!get_all_shooters.data) return <pre>No Data</pre>;
    return (
        <>
            <Stack>
                <Typography sx={{ marginBottom: 2 }} variant="h5">
                    Shooters managemant
                </Typography>
                <Box sx={{ height: "100%", width: "100%" }}>
                    <DataGrid
                        localeText={
                            zhTW.components.MuiDataGrid.defaultProps.localeText
                        }
                        slots={{
                            toolbar: GridToolbar,
                        }}
                        onCellClick={(
                            params: GridCellParams<any>,
                            event: MuiEvent<React.MouseEvent<HTMLElement>>,
                            detail: GridCallbackDetails
                        ) => {
                            if (params.field == "actions") return;
                        }}
                        columns={columns}
                        rows={get_all_shooters.data.getAllShooters}
                    />
                </Box>
            </Stack>
            <Dialog
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    close_all_popups();
                }}
                fullWidth
                maxWidth={"md"}
            >
                {createShooterPopupOpen ? (
                    <CreateShooterDialog
                        onClose={() => {
                            setDialogOpen(false);
                            close_all_popups();
                        }}
                        editShooter={editShooter}
                    />
                ) : (
                    <></>
                )}
            </Dialog>
            <Fab
                sx={{
                    position: "absolute",
                    bottom: 50,
                    right: 50,
                }}
                color="primary"
                onClick={() => {
                    setDialogOpen(true);
                    setCreateShooterPopupOpen(true);
                    setEditShooter(undefined);
                }}
            >
                <Add />
            </Fab>
        </>
    );
}
