
async function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 string
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

async function sendToBackend(name, description, tags, file) {
    const imageBase64 = await toBase64(file);

    const apiUrl = 'https://amelia-production.up.railway.app/api/toGithub'

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
        console.error('Error uploading image:', response.statusText);
        throw new Error(`Error: ${response.statusText}`);
    }
    return response.statusCode;
}