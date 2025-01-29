export default async function handler(req, res) {
    const fetch = (await import('node-fetch')).default;

    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache the preflight response for 24 hours
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Respond to OPTIONS requests with a 200 status
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { name, description, tags, imageBase64 } = req.body;

    if (!name) return res.status(400).json({message: "missing name"})
    if (!description) return res.status(400).json({message: "missing description"})
    if (!tags) return res.status(400).json({message: "missing tags"})
    if (!imageBase64) return res.status(400).json({message: "missing imageBase64"})
    try {
        await makeCommit(
            {
                path: `json/${
                    (Math.random().toString(16)).substring(0, 6)
                }`,
                content: JSON.stringify(
                    {
                        name: name,
                        description: description,
                        tags: tags,
                        imageBase64: imageBase64
                    }
                ),
            }
            `add ${name} [server]`
        )
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error in upload image to github',
            error: error.message
        });
    }
}

async function makeCommit(files, commitMessage) {
    const axios = (await import("axios")).default;

    const GITHUB_API_BASE = "https://api.github.com";
    const OWNER = "AS1624";
    const REPO = "ameliacdn";
    const BRANCH = "main";
    const TOKEN = process.env.GITHUB_TOKEN;
    const authHeaders = {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: "application/vnd.github+json",
        },
    };

    // Step 1: Get the current commit and tree for the branch
    const branchResponse = await axios.get(
        `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`,
        authHeaders
    );
    const currentCommitSha = branchResponse.data.object.sha;

    const commitResponse = await axios.get(
        `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/git/commits/${currentCommitSha}`,
        authHeaders
    );
    const baseTreeSha = commitResponse.data.tree.sha;

    // Step 2: Create blobs for each file
    const blobs = await Promise.all(
        files.map(async (file) => {
            const blobResponse = await axios.post(
                `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/git/blobs`,
                {
                    content: file.content,
                    encoding: "utf-8",
                },
                authHeaders
            );
            return { path: file.path, sha: blobResponse.data.sha };
        })
    );

    // Step 3: Create a new tree with the blobs
    const treeResponse = await axios.post(
        `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/git/trees`,
        {
            base_tree: baseTreeSha,
            tree: blobs.map((blob) => ({
                path: blob.path,
                mode: "100644", // Regular file
                type: "blob",
                sha: blob.sha,
            })),
        },
        authHeaders
    );

    // Step 4: Create a new commit
    const commitResponseNew = await axios.post(
        `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/git/commits`,
        {
            message: commitMessage,
            tree: treeResponse.data.sha,
            parents: [currentCommitSha],
        },
        authHeaders
    );

    // Step 5: Update the branch to point to the new commit
    await axios.patch(
        `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
        {
            sha: commitResponseNew.data.sha,
        },
        authHeaders
    );
}