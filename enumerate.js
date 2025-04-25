async function getOutfits(search) {
    const url = getUrl() // from env.js

    let output = []
    const response = await fetch(url, {
        headers: { "Accept": "application/vnd.github.v3+json" }
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    data.map(async file => {
        let json = await fetch("json/" + file.name).then(result => result.json())
        let outfit = {
            name: json.name,
            description: json.description,
            tags: json.tags,
            blob: base64ToBlob(json.imageBase64),
        }
        let content = document.getElementById('content');

        let tags = outfit.tags.toString().toLowerCase().split(" ");
        let innerContent = `<div id="outfit-container">
            <h3 id="outfit-name">${outfit.name}</h3>
            <div id="outfit-img-container">
            <a href="/outfit.html?id=${file.name}"></a>
                <img src="${URL.createObjectURL(outfit.blob)}" alt="">
            </div>
            <div id="outfit-description">${outfit.description}</div>
            <div id="tag-container">`
        tags.forEach(tag => {
            let index = -1
            for (let i = 0; i < output.length; i++) {
                if(output[i][0] === tag) index = i
            }

            if(index > -1){
                output[index][1] ++
            }
            else {
                output.push([tag, 1])
            }
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
    })

    return output
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