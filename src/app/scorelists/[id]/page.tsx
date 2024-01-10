export default function ScorelistPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    return (
        <>
            {id}
        </>
    )
}