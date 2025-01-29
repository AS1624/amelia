const express = require('express');
const handler = require("./toGithub");
const toGithub = require("./toGithub");
const app = express();
const port = process.env.PORT || 8080;

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.get('/api/toGithub', toGithub)

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
