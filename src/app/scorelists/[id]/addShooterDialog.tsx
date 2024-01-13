import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Query } from "@/gql_dto";
import React from "react";


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

const CREATE_SCORE_MUTATION = gql`
    mutation CreateScore($shooterId: Int!, $scorelistId: Int!) {
        createScore(shooterId: $shooterId, scorelistId: $scorelistId) {
            id
        }
    }
`;

export interface AddShooterDialog {
    onClose: () => void,
    scorelistId: number
}

export default function AddShooterDialog(props: AddShooterDialog) {
    const all_shooter = useQuery<Query>(GET_ALL_SHOOTERS_QUERY);
    const [create_score, create_score_info] = useMutation<Query>(CREATE_SCORE_MUTATION);

    const [selectedShooter, setSelectedShooter] = React.useState();

    if (all_shooter.loading)
        return <pre>Loading...</pre>
    if (all_shooter.error)
        return <pre>Error: {JSON.stringify(all_shooter.error)}</pre>
    if (!all_shooter.data)
        return <pre>No Data</pre>
    return <>
        <DialogTitle>
            Add Shooter
        </DialogTitle>
        <DialogContent>
            <FormControl fullWidth>
                <InputLabel>Shooter</InputLabel>
                <Select
                    value={selectedShooter}
                    label="Shooter"
                    onChange={(v) => {
                        setSelectedShooter(parseInt(v.target.value as string))
                    }}
                >
                    {all_shooter.data.getAllShooters.map((v) =>
                        v ?
                            <MenuItem value={v.id} key={v.id}>{v.name}</MenuItem>
                            : <></>
                    )}
                </Select>
            </FormControl>
        </DialogContent>
        <DialogActions>
            <Button onClick={props.onClose}>Cancel</Button>
            <Button onClick={() => {
                create_score({
                    variables: {
                        scorelistId: props.scorelistId,
                        shooterId: selectedShooter
                    },
                    onCompleted(data, clientOptions) {
                        props.onClose()
                    },
                    onError(error, clientOptions) {
                        alert("Fail to add shooter!")
                    },
                })
            }} autoFocus>
                Add
            </Button>
        </DialogActions>
    </>
}