import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, Select } from "@mui/material";
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

    const [selectedShooter, setSelectedShooter] = React.useState<number[]>([]);

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
                    multiple
                    renderValue={(selected) => {
                        let name_list = selected.map((v) => {
                            return all_shooter.data?.getAllShooters[v]?.name ?? "";
                        })
                        return name_list.join(", ");
                    }}
                    onChange={(v) => {
                        setSelectedShooter(v.target.value)
                    }}
                >
                    {all_shooter.data.getAllShooters.map((v, i) =>
                        v ?
                            <MenuItem key={v.id} value={i}>
                                <Checkbox checked={selectedShooter.indexOf(i) > -1} />
                                <ListItemText primary={v.name} />
                            </MenuItem>
                            // <MenuItem value={v.id} key={v.id}>{v.name}</MenuItem>
                            : <></>
                    )}
                </Select>
            </FormControl>
        </DialogContent>
        <DialogActions>
            <Button onClick={props.onClose}>Cancel</Button>
            <Button onClick={async () => {
                let id_list = selectedShooter.map((v) => {
                    return all_shooter.data?.getAllShooters[v]?.id ?? 1;
                })
                for (let v in id_list) {
                    await new Promise<void>((resolve, rejecct) => {
                        create_score({
                            variables: {
                                scorelistId: props.scorelistId,
                                shooterId: id_list[v]
                            },
                            onCompleted(data, clientOptions) {
                                props.onClose()
                                resolve();
                            },
                            onError(error, clientOptions) {
                                alert("Fail to add shooter!")
                                rejecct();
                            },
                        })
                    })
                }
            }} autoFocus>
                Add
            </Button>
        </DialogActions>
    </>
}