async function listRepoFiles(owner, repo, path = "") {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

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
                return await fetch(file.url)
            })
        ).then(results => { return results; });
    } catch (error) {
        console.error("Error fetching repository contents:", error);
        return [];
    }
}
function base64ToBlob(base64, mimeType = '') {
    const byteCharacters = atob(base64); // Decode Base64
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}


// Example usage
async function getOutfits() { return await listRepoFiles("AS1624", "ameliacdn", "json"); }