"use client";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Query } from "@/gql_dto";
import {
    Button,
    Card,
    CardActionArea,
    Dialog,
    DialogActions,
    DialogContentText,
    DialogTitle,
    Divider,
    Fab,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { EROUTE_LIST, ROUTE_LIST } from "@/constant";
import { Add } from "@mui/icons-material";
import React from "react";

const GET_SCOREBOARD_QUREY = gql`
    query GetScoreboard($id: Int!) {
        getScoreboard(id: $id) {
            createdAt
            id
            isLocked
            name
            scorelists {
                isLocked
                id
                createdAt
                stage {
                    id
                    name
                }
            }
        }
    }
`;
const LOCK_SCORELIST_MUTATION = gql`
    mutation LockScorelist($id: Int!) {
        lockScorelist(id: $id){
            id
        }
    }
`;
const SUBSCRIBE_TO_SCORELIST_UPDATE_SUBSCRIPTION = gql`
    subscription SubscribeToScorelistUpdate{
        subscribeToScorelistUpdate
    }
`;
const CREATE_SCORELIST_MUTATION = gql`
    mutation CreateScorelist($stageId:Int!,$scoreboardId: Int!){
        createScorelist(
            stageId:$stageId
            scoreboardId:$scoreboardId
        ) {
            createdAt
            id
            isLocked
        }
    }
`;

const GET_ALL_STAGE_QUERY = gql`
    query {
        getAllStages {
            id
            name
        }
    }
`

export default function ScoreboardPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const router = useRouter();
    const scoreboard = useQuery<Query>(GET_SCOREBOARD_QUREY, {
        variables: { id: id },
    });
    const all_stage = useQuery<Query>(GET_ALL_STAGE_QUERY)
    const [lock_scorelist] = useMutation(LOCK_SCORELIST_MUTATION);
    const [create_scorelist] = useMutation(CREATE_SCORELIST_MUTATION);
    useSubscription(SUBSCRIBE_TO_SCORELIST_UPDATE_SUBSCRIPTION, {
        onData(options) {
            scoreboard.refetch()
        },
    });

    const [selectedStage, setSelectedStage] = React.useState(0);

    const [dialogOpen, setDialogOpen] = React.useState(false);

    if (scoreboard.loading) return <pre>Loading...</pre>;
    if (scoreboard.error)
        return <pre>ERROR: {JSON.stringify(scoreboard.error)}</pre>;
    if (!scoreboard.data) return <pre>No data</pre>;

    return (
        <>
            <Stack gap={2} divider={<Divider />}>
                <h1>Scoreboard: {scoreboard.data.getScoreboard.name}</h1>
                {scoreboard.data.getScoreboard.scorelists.map((v, i) => (
                    <Card elevation={10} key={i}>
                        <Grid container alignItems={"center"}>
                            <Grid item xs={8} md={11}>
                                <CardActionArea
                                    onClick={() => {
                                        router.push(
                                            `${ROUTE_LIST[EROUTE_LIST.Scorelists].dir}/${v.id}`
                                        );
                                    }}
                                >
                                    <Grid
                                        container
                                        spacing={2}
                                        alignItems={"center"}
                                        sx={{ padding: 1 }}
                                    >
                                        <Grid item xs={12}>
                                            <Typography
                                                variant="h4"
                                                sx={{ textAlign: "left" }}
                                            >
                                                {v.stage.name}
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            item
                                            xs={12}
                                            sx={{ justifyContent: "center" }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    textAlign: "left",
                                                    justifyContent: "center",
                                                    fontSize: "small",
                                                }}
                                                color={"GrayText"}
                                            >
                                                {new Date(
                                                    v.createdAt
                                                ).toLocaleDateString() +
                                                    new Date(
                                                        v.createdAt
                                                    ).toLocaleTimeString()}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardActionArea>
                            </Grid>
                            <Grid item xs={4} md={1}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    fullWidth
                                    disabled={v.isLocked}
                                    sx={{ height: 100 }}
                                    onClick={() => {
                                        if (
                                            !confirm(
                                                "Are you sure you want to lock this scorelist? after locked the score inside of this scorelist will be IMMUTABLE ! "
                                            )
                                        )
                                            return;
                                        if (
                                            prompt(
                                                `Type this scorelist (${v.stage.name}) to process the lock action`
                                            ) === v.stage.name
                                        ) {
                                            lock_scorelist({
                                                variables: {
                                                    id: v.id,
                                                },
                                            });
                                            return;
                                        } else {
                                            alert("Wrong name");
                                        }
                                    }}
                                >
                                    Lock
                                </Button>
                            </Grid>
                        </Grid>
                    </Card>
                ))}
            </Stack >
            <Fab
                sx={{
                    position: "absolute",
                    bottom: 50,
                    right: 50,
                }}
                color="primary"
                onClick={() => setDialogOpen(true)}
            >
                <Add />
            </Fab>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={"sm"} fullWidth>
                <DialogTitle>Add Scorelists</DialogTitle>
                <DialogContentText>
                    <FormControl fullWidth>
                        <InputLabel children="Stage" />
                        <Select label={"Stage"} value={selectedStage} onChange={(v) => setSelectedStage(v.target.value as number)}>
                            {all_stage.data?.getAllStages.map((v, i) =>
                                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </DialogContentText>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                        create_scorelist({
                            variables: {
                                stageId: selectedStage,
                                scoreboardId: id,
                            },
                            onError(error, clientOptions) {
                                alert("Fail to process")
                            },
                        })
                        setDialogOpen(false);
                    }}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
