
async function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 string
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

async function sendToBackend(name, description, tags, file) {
    try {
        const imageBase64 = await toBase64(file);

        // API endpoint of your Vercel backend
        const apiUrl = 'https://ameliaoutfits.vercel.app/api/toGithub';

        // Payload to send to the backend
        const payload = {
            name: name,
            description: description,
            tags: tags,
            imageBase64: imageBase64,
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();

        // Fetch and display the uploaded image
        const rawImageUrl = `https://raw.githubusercontent.com/AS1624/ameliacdn/main/images/${file.name}`;

    } catch (error) {
        console.error('Error uploading image:', error);
    }
}