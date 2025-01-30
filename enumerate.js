async function getOutfits(search) {
    const url = `https://api.github.com/repos/as1624/amelia/contents/json`;

    try {
        const response = await fetch(url, {
            headers: { "Accept": "application/vnd.github.v3+json" }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        data.map(async file => {
            try {
                let json = await fetch("json/" + file.name).then(result => result.json())
                let outfit = {
                    name: json.name,
                    description: json.description,
                    tags: json.tags,
                    blob: base64ToBlob(json.imageBase64),
                }
                let content = document.getElementById('content');

                console.log(outfit);
                let tags = outfit.tags.toString().toLowerCase().split(" ");
                let innerContent = `<div id="outfit-container">
                    <h3 id="outfit-name">${outfit.name}</h3>
                    <div id="outfit-img-container">
                        <img src="${URL.createObjectURL(outfit.blob)}" alt="">
                    </div>
                    <div id="outfit-description">${outfit.description}</div>
                    <div id="tag-container">`
                tags.forEach(tag => {
                    innerContent += `<span id="outfit-tag">${tag}</span>`
                })
                innerContent += "</div></div>"
                if(
                    !search
                    || tags.indexOf(search.toLowerCase()) > -1
                    || outfit.description.indexOf(search.toLowerCase()) > -1
                ) {
                    content.innerHTML += innerContent
                }
            }
            catch (error) {
                console.log(error);
            }
        })

    } catch (error) {
        console.error("Error fetching repository contents:", error);
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