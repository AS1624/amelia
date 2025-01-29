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
        return data.map(file => file.name);
    } catch (error) {
        console.error("Error fetching repository contents:", error);
        return [];
    }
}

// Example usage
listRepoFiles("AS1624", "ameliacdn", "images").then(files => console.log(files));