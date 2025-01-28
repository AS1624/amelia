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

    const { fileName, imageBase64, path } = req.body;

    if (!fileName || !imageBase64 || !path) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const url = `https://api.github.com/repos/ameliacdn/contents/${path}/${fileName}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add image ${fileName}`,
                content: imageBase64, // Base64 string of the image
                branch: "main",
            }),
        });

        const result = await response.json();

        if (response.ok) {
            res.status(200).json({ message: 'Image uploaded successfully' });
        } else {
            res.status(response.status).json({ message: result.message });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error in upload image to github', error: error });
    }
}
