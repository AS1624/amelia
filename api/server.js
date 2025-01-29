const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
// Basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.post('/api/toGithub', (req, res) => {toGithub(req, res);});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
function toGithub(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { name, description, tags, imageBase64 } = req.body;

    if (!name)        return res.status(400).json({message: "missing name"})
    if (!description) return res.status(400).json({message: "missing description"})
    if (!tags)        return res.status(400).json({message: "missing tags"})
    if (!imageBase64) return res.status(400).json({message: "missing imageBase64"})
    try {
        makeCommit(
            {
                path: `json/${
                    (Math.random().toString(16)).substring(2, 8)
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
function makeCommit(file, commitMessage) {
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

    axios.put(
        `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/contents/${file.path}`,
        {
            message: commitMessage,
            content: Buffer.from(file.content, "utf-8").toString("base64"),
        },
        authHeaders
    ).then(r => { return r } );
}
