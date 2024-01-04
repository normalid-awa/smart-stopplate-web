import { Paper } from "@mui/material";



export interface StageInfoDialogProps {
    stage_id: number;
}

export default function StageInfoDialog(props: StageInfoDialogProps) {
    return (
        <>
            <Paper sx={{ width: "100%", height: "100%", padding: 2, zIndex: (theme) => theme.zIndex.drawer + 2 }}>
                Stage statistics 
                id : {props.stage_id}
                <h1>This feature are currently WIP.....Coming soon....</h1>
            </Paper>
        </>
    )
}