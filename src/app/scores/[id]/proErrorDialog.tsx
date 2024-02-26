"use client"
import { ProErrorItem, ProErrorListItem , Query } from "@/gql_dto";
import { gql, useMutation, useQuery } from "@apollo/client"
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material"
import React from "react";
import { styled } from '@mui/material/styles';
import { Add, Remove } from "@mui/icons-material";


const GET_ALL_PRO_ERROR_QUERY = gql`
    query {
        getAllProError {
            big_title
            big_title_zh
            content
            content_zh
            single_punishment
            id
        }
    }
`


const ProErrorRoot = styled(Paper, {
    name: 'ProError', // The component name
    slot: 'root', // The slot name
})(({ theme }) => ({
    padding: theme.spacing(2),
    textWrap: "nowrap"
}));

const ProErrorTitle = styled("p", {
    name: 'ProError',
    slot: 'title',
})(({ theme }) => ({
    ...theme.typography.h5,
    display: "inline-block",
    textWrap: "wrap",
    height: "100%"
}));

const ProErrorValueRoot = styled(Paper, {
    name: 'ProError',
    slot: 'valueRoot',
})(({ theme }) => ({
    ...theme.typography.h5,
    display: "inline-block",
    float: "right",
}));
const ProErrorCount = styled(Typography, {
    name: 'ProError',
    slot: 'count',
})(({ theme }) => ({
    ...theme.typography.h5,
    display: "inline-block",
}));
const ProErrorAdjustMinus = styled(IconButton, {
    name: 'ProError',
    slot: 'ajustMinus',
})(({ theme }) => ({
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
}));
const ProErrorAdjustPlus = styled(IconButton, {
    name: 'ProError',
    slot: 'adjustPlus',
})(({ theme }) => ({
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
}));

const ProErrorItem = React.forwardRef((props: {
    count: number;
    proErrorInfo: ProErrorItem;
    onChange: (delta: number) => void;
}) => {
    const { count, proErrorInfo, onChange, ...other } = props;

    return (
        <ProErrorRoot elevation={10} {...other}>
            <ProErrorTitle>{proErrorInfo.big_title_zh}</ProErrorTitle>
            <ProErrorValueRoot>
                <ProErrorAdjustMinus onClick={() => count > 0 ? onChange(-1) : null} children={<Remove />} />
                <ProErrorCount>{count}</ProErrorCount>
                <ProErrorAdjustPlus onClick={() => proErrorInfo.single_punishment ? count < 1 ? onChange(1) : null : onChange(1)} children={<Add />} />
            </ProErrorValueRoot>
        </ProErrorRoot>
    );
});
export interface ProErrorDialogProps {
    onClose?: () => void;
    onChange: (pro_error_list: ProErrorListItem[]) => void;
    value: ProErrorListItem[];
}

export default function ProErrorDialog(props: ProErrorDialogProps) {
    const pro_error_data = useQuery<Query>(GET_ALL_PRO_ERROR_QUERY);


    function handle_pro_change(pro_id: number, delta: number) {
        let new_list = props.value;
        let i = new_list.findIndex((v) => v.pro_id === pro_id);
        if (i !== -1) new_list[i].count += delta;
        else new_list.push({ pro_id: pro_id, count: delta });
        props.onChange([...new_list]);
    }

    if (pro_error_data.loading)
        return <pre>Loading...</pre>
    if (pro_error_data.error)
        return <pre>Error: {Date.now()} : {JSON.stringify(pro_error_data.error)}</pre>
    if (!pro_error_data.data)
        return <pre>No data</pre>

    return (
        <>
            <DialogTitle>Pro error</DialogTitle>
            <DialogContent>
                <Stack gap={1}>
                    {
                        pro_error_data.data.getAllProError.map((v) =>
                            <ProErrorItem
                                key={v.id}
                                proErrorInfo={v}
                                count={props.value.find(p => p.pro_id === v.id)?.count ?? 0}
                                onChange={d => handle_pro_change(v.id, d)}
                            />
                        )
                    }
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>OK</Button>
            </DialogActions>
        </>
    )
}