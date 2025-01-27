function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get the base64 string
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}
