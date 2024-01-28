"use client"
import { Query } from "@/gql_dto";
import { gql, useMutation, useQuery } from "@apollo/client"
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import React from "react";


const GET_ALL_DQ_QUERY = gql`
    query {
        getAllDqReason {
            category
            category_zh
            content
            content_zh
            id
        }
    }
`

const SET_DQ_MUTATION = gql`
    mutation SetScoreDQ(
        $id: Int!,
        $dq_reason: Int!
    ) {
        setScoreDQ(
            id: $id,
            dq_reason: $dq_reason,
        ) {
            id
        }
    }
`

export interface DQDialogProps {
    onClose?: () => void;
    scoreId: number;
}

export default function DQDialog(props: DQDialogProps) {
    const dq_data = useQuery<Query>(GET_ALL_DQ_QUERY);
    const [set_dq] = useMutation(SET_DQ_MUTATION);

    const [selectedCategory, setSelectedCategory] = React.useState(1);
    const [selectedReason, setSelectedReason] = React.useState(1);

    function handleSubmit() {
        set_dq({
            variables: {
                id: props.scoreId,
                dq_reason: selectedReason,
            },
            onError(error, clientOptions) {
                alert("Fail to dq shooter")
                alert(`ERROR! ${Date.now()}: ${JSON.stringify(error)}`)
            },
            onCompleted(data, clientOptions) {
                alert("DQed")
                if (!props.onClose)
                    return
                props.onClose();
            },
        })
    }

    if (dq_data.loading)
        return <pre>Loading...</pre>
    if (dq_data.error)
        return <pre>Error: {Date.now()} : {JSON.stringify(dq_data.error)}</pre>
    if (!dq_data.data)
        return <pre>No data</pre>

    return (
        <>
            <DialogTitle>DQ Reason</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ my: 1 }}>
                    <InputLabel>DQ Category</InputLabel>
                    <Select
                        value={selectedCategory}
                        label="DQ Category"
                        onChange={(v) => setSelectedCategory(v.target.value as number)}
                    >
                        {dq_data.data.getAllDqReason.filter(
                            (obj, index) =>
                                dq_data.data?.getAllDqReason.findIndex((item) => item.category_zh === obj.category_zh) === index
                        ).map(v =>
                            <MenuItem value={v.id} key={v.id}>{v.category_zh}</MenuItem>
                        )}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ my: 1 }}>
                    <InputLabel>DQ Reason</InputLabel>
                    <Select
                        value={selectedReason}
                        label="DQ Reason"
                        onChange={(v) => setSelectedReason(v.target.value as number)}
                    >
                        {dq_data.data.getAllDqReason.filter(v => v.category_zh == dq_data.data?.getAllDqReason[selectedCategory].category_zh).map(v =>
                            <MenuItem sx={{overflowY:"auto"}} value={v.id} key={v.id}>{v.content_zh}</MenuItem>
                        )}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button variant="contained" color="error" type="submit" onClick={handleSubmit}>DQ</Button>
            </DialogActions>
        </>
    )
}