export async function postPeer(jsonBody) {
    const response = await fetch(
        "/peer/",
        {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: jsonBody
        }
    )
    return response
}