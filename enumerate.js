async function getOutfits() {
    const url = `https://api.github.com/repos/as1624/amelia/contents/json`;

    try {
        const response = await fetch(url, {
            headers: { "Accept": "application/vnd.github.v3+json" }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return Promise.all(
            data.map(async file => {
                return (await fetch("/json/" + file.name).then(result => result.json()));
            })
        ).then(results => { return results.map(json => {
            return {
                name: json.name,
                description: json.description,
                tags: json.tags,
                blob: base64ToBlob(json.imageBase64),
            }
            }
        )});
    } catch (error) {
        console.error("Error fetching repository contents:", error);
        return [];
    }
}
function base64ToBlob(base64, mimeType = '') {
    console.log(base64)
    const byteCharacters = atob(base64); // Decode Base64
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}