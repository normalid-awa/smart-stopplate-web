"use client";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Query } from "@/gql_dto";
import {
    Button,
    Card,
    CardActionArea,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { EROUTE_LIST, ROUTE_LIST } from "@/constant";

const GET_SCOREBOARD_QUREY = gql`
    query GetScoreboard($id: Int!) {
        getScoreboard(id: $id) {
            createdAt
            id
            isLocked
            name
            scorelists {
                isLocked
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

export default function ScoreboardPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const router = useRouter();
    const scoreboard = useQuery<Query>(GET_SCOREBOARD_QUREY, {
        variables: { id: id },
    });
    const [lock_scorelist, _] = useMutation(LOCK_SCORELIST_MUTATION);

    if (scoreboard.loading) return <pre>Loading...</pre>;
    if (scoreboard.error)
        return <pre>ERROR: {JSON.stringify(scoreboard.error)}</pre>;
    if (!scoreboard.data) return <pre>No data</pre>;

    return (
        <>
            <Stack gap={2} divider={<Divider />}>
                <h1>Scoreboard: {scoreboard.data.getScoreboard.name}</h1>
                {scoreboard.data.getScoreboard.scorelists.map((v) => (
                    <Card elevation={10} key={v.id}>
                        <Grid container alignItems={"center"}>
                            <Grid item xs={8} md={11}>
                                <CardActionArea
                                    onClick={() => {
                                        router.push(
                                            `${ROUTE_LIST[EROUTE_LIST.Scorelists].dir}/${v.stage.id}`
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
        </>
    );
}
