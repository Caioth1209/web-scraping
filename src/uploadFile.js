const openai = require("./service/openai");

async function uploadFile(filePath) {
    const file = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'assistants'
    });

    return file.id;
}

module.exports = { uploadFile }