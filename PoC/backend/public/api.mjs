export async function postPeer(id, candidate) {
    const response = await fetch(
        "/peer/",
        {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ id, candidate })
        }
    )
    return response
}