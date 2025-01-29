async function toGithub(req, res) {
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

    if (!name)        return res.status(400).json({message: "missing name"})
    if (!description) return res.status(400).json({message: "missing description"})
    if (!tags)        return res.status(400).json({message: "missing tags"})
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
            },
            `add ${name} [server]`
        )
    } catch (error) {
        console.log(error.stack);
        console.log(error.message);
        res.status(500).json({
            message: 'Internal Server Error in upload image to github',
            error: error.message
        });
    }
}
async function makeCommit(file, commitMessage) {
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

    await axios.put(
        `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/contents/${file.path}`,
        {
            message: commitMessage,
            content: Buffer.from(file.content, "utf-8").toString("base64"),
            sha: null,
            branch: BRANCH, // The branch to commit to
        },
        authHeaders
    );
}

