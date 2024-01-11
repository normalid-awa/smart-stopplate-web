"use client"
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, PaperProps, Select, SpeedDial, SpeedDialAction, SpeedDialIcon, Stack, Typography, TypographyProps, styled, useTheme } from "@mui/material";
import { Query, Score } from "@/gql_dto";
import React from "react";
import { DataGrid, GridColDef, GridValueGetterParams, useGridApiRef } from '@mui/x-data-grid';
import { Delete, Edit, PeopleOutlined, PersonAdd, Queue } from "@mui/icons-material";
import AddShooterDialog from "./addShooterDialog"

const GET_SCORELIST_QUERY = gql`
    query GetScorelist($id:Int!){
        getScorelist(id: $id){
            createdAt
            id
            isLocked
            stage{ 
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
                shooter{ 
                    name
                }
            }
        }
    }
`

const SUBSCRIBE_TO_SCORE_UPDATE = gql`
    subscription {
        subscribeToScoreUpdate
    }
`

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: 'absolute',
    '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
    '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
        top: theme.spacing(2),
        left: theme.spacing(2),
    },
}));

export default function ScorelistPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const scorelist = useQuery<Query>(GET_SCORELIST_QUERY, { variables: { id } });
    const _ = useSubscription<Query>(SUBSCRIBE_TO_SCORE_UPDATE, {
        onData(options) {
            scorelist.refetch()
        },
    });



    const [dialogOpen, setDialogOpen] = React.useState(false);

    const theme = useTheme();
    // #region collumn def
    interface ActionButtonProps {
        row: Score;
    }
    const EditActionButton = (props: ActionButtonProps) => {
        return (
            <IconButton
                onClick={() => {
                    // let index = get_all_shooters.data?.getAllShooters.findIndex((v) => v?.id === props.row.id)
                    // setEditShooter(get_all_shooters.data?.getAllShooters[index as number] as React.SetStateAction<Shooter | undefined>);
                    // setDialogOpen(true);
                    // setCreateShooterPopupOpen(true);
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
                    // let index = get_all_shooters.data?.getAllShooters.findIndex((v) => v?.id === props.row.id)
                    // setEditShooter(get_all_shooters.data?.getAllShooters[index as number] as React.SetStateAction<Shooter | undefined>);
                    // setDialogOpen(true);
                    // setCreateShooterPopupOpen(true);
                }}
            >
                <Delete />
            </IconButton>
        )
    }
    const columns: GridColDef[] = [
        {
            field: "ID",
            valueGetter: (params) => {
                return params.row.id;
            },
            type: "number",
            flex: 0.01,
        },
        {
            field: "Name",
            valueGetter: (params) => {
                return params.row.shooter.name;
            },
            type: "string",
            flex: 4,
            minWidth: parseInt(theme.spacing(10)),
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
                return params.row.hitFactor;
            },
            type: "number",
            flex: 2,
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            cellClassName: "actions",
            getActions: ({ id, row }) => {
                return [<EditActionButton row={row} />, <DeleteActionButton row={row} />];
            },
        },
    ];
    // #endregion

    if (scorelist.loading)
        return <pre>Loading...</pre>
    if (scorelist.error)
        return <pre>Error: {JSON.stringify(scorelist.error)}</pre>
    if (!scorelist.data)
        return <pre>No Data</pre>
    return (
        <>
            <Stack divider={<Divider />} gap={2}>
                <h5>You are currently scoring stage: {scorelist.data.getScorelist.stage.name}</h5>
                <DataGrid
                    rows={scorelist.data.getScorelist.scores}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                />
            </Stack >
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
                        setDialogOpen(true)
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
                onClose={() => setDialogOpen(false)}
            >
                <AddShooterDialog onClose={() => setDialogOpen(false)} scorelistId={id} />
            </Dialog>
        </>
    )
}