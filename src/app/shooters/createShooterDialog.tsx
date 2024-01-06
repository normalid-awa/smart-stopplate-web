"use client";
import { gql, useMutation } from "@apollo/client";
import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material";
import React from "react";
import { Shooter } from "@/gql_dto";

const CREATE_SHOOTER_MUTATION = gql`
    mutation CreateShooter($division: String!, $name: String!) {
        createShooter(division: $division, name: $name) {
            id
            createdAt
            division
            name
        }
    }
`;
const UPDATE_SHOOTER_MUTATION = gql`
    mutation UpdateShooter($id:Int!, $name: String!,$division: String!) {
        updateShooter(id: $id, name: $name, division: $division) {
            createdAt
            division
            id
            name
        }
}
`;

interface CreateShooterDialogProps {
    onClose: () => void;
    editShooter?: Shooter;
}
export default function CreateShooterDialog(props: CreateShooterDialogProps) {
    const [create_shooter_mutation, create_shooter_mutation_info] = useMutation(
        CREATE_SHOOTER_MUTATION
    );
    const [update_shooter_mutation, update_shooter_mutation_info] = useMutation(
        UPDATE_SHOOTER_MUTATION
    );
    const [formData, setFormData] = React.useState({
        division: "OPEN",
        name: "",
    });

    React.useEffect(() => {
        if (props.editShooter) {
            setFormData({
                division: props.editShooter.division,
                name: props.editShooter.name,
            });
        }
        return () => {
            console.log("unmouse")
        }
    }, []);

    function update_string_form_data(
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>
    ) {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    function submit_form() {
        create_shooter_mutation({
            variables: {
                division: formData.division,
                name: formData.name,
            },
            onCompleted(data, clientOptions) {
                alert("Create shooter success!");
                props.onClose();
            },
            onError(err) {
                alert("Error when creating shooter!");
                alert("Error info:" + JSON.stringify(err));
            },
        });
    }
    function update_shooter() {
        update_shooter_mutation({
            variables: {
                id: props.editShooter?.id,
                division: formData.division,
                name: formData.name,
            },
            onCompleted(data, clientOptions) {
                alert("Apply change to shooter success!");
                props.onClose();
            },
            onError(err) {
                alert("Error when editing shooter!");
                alert("Error info:" + JSON.stringify(err));
            },
        });
    }

    return (
        <>
            <Grid container spacing={2} sx={{ padding: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="h4">Create Shooter:</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Name</InputLabel>
                        <OutlinedInput
                            error={formData.name === ""}
                            label="Name"
                            placeholder="Name"
                            name="name"
                            value={formData.name}
                            onChange={update_string_form_data}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Division</InputLabel>
                        <Select
                            label="Division"
                            name="division"
                            value={formData.division}
                            onChange={update_string_form_data}
                        >
                            <MenuItem value={"OPEN"}>Open</MenuItem>
                            <MenuItem value={"STANDARD"}>Standard</MenuItem>
                            <MenuItem value={"CLASSIC"}>Classic</MenuItem>
                            <MenuItem value={"PRODUCTION"}>Production</MenuItem>
                            <MenuItem value={"PRODUCTIONOPTICS"}>
                                Production Optics
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} md={6}>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="warning"
                        onClick={props.onClose}
                    >
                        Cancel
                    </Button>
                </Grid>
                <Grid item xs={6} md={6}>
                    {props.editShooter ? (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={update_shooter}
                            disabled={formData.name === ""}
                            color="success"
                        >
                            Apply
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={submit_form}
                            disabled={formData.name === ""}
                        >
                            Create
                        </Button>
                    )}
                </Grid>
            </Grid>
        </>
    );
}
