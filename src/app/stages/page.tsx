"use client";
import { Query, Stages } from "@/gql_dto";
import { useQuery, gql } from "@apollo/client";
import {
    Box,
    Button,
    Grid,
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
    GridCellParams,
    GridColDef,
    GridToolbar,
    MuiEvent,
    zhTW,
} from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";
import { Lock, Delete, Edit } from "@mui/icons-material";
const FILMS_QUERY = gql`
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
        }
    }
`;

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
        pinnable: true,
    },
    {
        field: "Name",
        valueGetter: (params) => {
            return params.row.name;
        },
        minWidth: 200,
        flex: 1,
        resizable: true,
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
        getActions: ({ id }) => {
            return [
                <IconButton>
                    <Delete />
                </IconButton>,
                <IconButton>
                    <Lock />
                </IconButton>,
                <IconButton>
                    <Edit />
                </IconButton>,
            ];
        },
    },
];
export default function StagesPage() {
    const { data, loading, error } = useQuery<Query>(FILMS_QUERY);

    if (loading) return "Loading...";
    if (error) return <pre>{error.message}</pre>;
    if (!data) return <pre>no data</pre>;
    return (
        <>
            <Stack>
                <Typography variant="h5">Stages managemant</Typography>
                {/* {JSON.stringify(data.getAllStages[0])} */}
                <Box sx={{ height: "100%", width: "100%" }}>
                    <DataGrid
                        localeText={
                            zhTW.components.MuiDataGrid.defaultProps.localeText
                        }
                        columns={columns}
                        rows={data.getAllStages}
                        slots={{
                            toolbar: GridToolbar,
                        }}
                        onCellClick={(
                            params: GridCellParams<any>,
                            event: MuiEvent<React.MouseEvent<HTMLElement>>,
                            detail: GridCallbackDetails
                        ) => {
                            console.log(params, event, detail);
                        }}
                    />
                </Box>
            </Stack>
        </>
    );
}
