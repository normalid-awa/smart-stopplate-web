"use client";
import { gql, useMutation } from "@apollo/client";
import {
    Button,
    FormControl,
    Grid,
    Input,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    styled,
} from "@mui/material";
import React from "react";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

interface CreateStageDialogProps {
    onClose: React.MouseEventHandler<HTMLButtonElement> | (() => void);
}

const CREATE_STAGE_MUTATION = gql`
    mutation LockStage(
        $name: String!
        $description: String!
        $noShoots: Int!
        $paperTargets: Int!
        $popperTargets: Int!
    ) {
        createStage(
            name: $name
            description: $description
            noShoots: $noShoots
            paperTargets: $paperTargets
            popperTargets: $popperTargets
        ) {
            id
        }
    }
`;

export default function CreateStageDialog(props: CreateStageDialogProps) {
    const [create_stage, create_stage_info] = useMutation(CREATE_STAGE_MUTATION);
    const [isFormComplete, setIsFormComplete] = React.useState(false);

    const [formData, setFormData] = React.useState({
        name: "",
        description: "",
        papers: 0,
        noShoots: 0,
        poppers: 0,
        condition: 1,
    });
    const [stageStatics, setStageStatics] = React.useState({
        stageType: 0,
        minimumRounds: 0,
        maximumPoints: 0,
    });

    function update_string_form_data(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }
    function update_int_form_data(
        event:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<number>
    ) {
        setFormData({
            ...formData,
            [event.target.name]: parseInt(event.target.value as string),
        });
    }

    function submit_form() {
        if (!cheack_form_complete())
            return;
        create_stage({
            variables: {
                name: formData.name,
                description: formData.description,
                noShoots: formData.noShoots,
                paperTargets: formData.papers,
                popperTargets: formData.poppers,
                condition: formData.condition,
            },
            onError(error, clientOptions) {
                alert("Create Stage Error!")
                alert("Log: " + JSON.stringify(error))
            },
            onCompleted(data, clientOptions) {
                alert("Create Stage Succeed!")
            },
        })
    }

    function cheack_form_complete() {
        return (formData.name == "" ||
            formData.description == "" ||
            isNaN(formData.papers) ||
            isNaN(formData.noShoots) ||
            isNaN(formData.poppers))
    }

    React.useEffect(() => {
        setIsFormComplete(cheack_form_complete());
    }, [formData])

    return (
        <>
            <Grid container spacing={2} sx={{ padding: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="h4">Create Stage:</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        error={formData.name == ""}
                        required
                        label="Stage name"
                        name="name"
                        value={formData.name}
                        fullWidth
                        onChange={update_string_form_data}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        error={formData.description == ""}
                        required
                        label="Description"
                        fullWidth
                        multiline
                        name="description"
                        value={formData.description}
                        onChange={update_string_form_data}
                    />
                </Grid>
                <Grid item xs={6}>
                    <OutlinedInput
                        error={isNaN(formData.papers)}
                        required
                        inputProps={{
                            min: 0,
                            step: 1,
                            type: "number",
                        }}
                        fullWidth
                        startAdornment={
                            <InputAdornment position="start">
                                Papers:
                            </InputAdornment>
                        }
                        name="papers"
                        value={formData.papers}
                        onChange={update_int_form_data}
                    />
                </Grid>
                <Grid item xs={6}>
                    <OutlinedInput
                        error={isNaN(formData.noShoots)}
                        required
                        inputProps={{
                            min: 0,
                            step: 1,
                            type: "number",
                        }}
                        fullWidth
                        startAdornment={
                            <InputAdornment position="start">
                                No-shoots:
                            </InputAdornment>
                        }
                        value={formData.noShoots}
                        name="noShoots"
                        onChange={update_int_form_data}
                    />
                </Grid>
                <Grid item xs={6}>
                    <OutlinedInput
                        error={isNaN(formData.poppers)}
                        required
                        inputProps={{
                            step: 1,
                            min: 0,
                            type: "number",
                        }}
                        fullWidth
                        startAdornment={
                            <InputAdornment position="start">
                                Poppers:
                            </InputAdornment>
                        }
                        value={formData.poppers}
                        name="poppers"
                        onChange={update_int_form_data}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>Condition</InputLabel>
                        <Select
                            label="Condition"
                            name="condition"
                            value={formData.condition}
                            onChange={update_int_form_data}
                        >
                            <MenuItem value={1}>Condition 1</MenuItem>
                            <MenuItem value={2}>Condition 2</MenuItem>
                            <MenuItem value={3}>Condition 3</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={12 / 3}>
                    <Item>Stage type: {stageStatics.stageType}</Item>
                </Grid>
                <Grid item xs={12 / 2} sm={12 / 3}>
                    <Item>Min. rounds: {stageStatics.minimumRounds}</Item>
                </Grid>
                <Grid item xs={12 / 2} sm={12 / 3}>
                    <Item>Max. points: {stageStatics.maximumPoints}</Item>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="warning"
                        onClick={props.onClose}
                    >
                        Cancel
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button fullWidth variant="contained" color="success" onClick={submit_form} disabled={isFormComplete}>
                        Confirm
                    </Button>
                </Grid>
            </Grid>
        </>
    );
}
