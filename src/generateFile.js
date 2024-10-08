const fs = require('fs');

function generateFile(references, filePath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);

        fileStream.on('error', (error) => {
            console.error('Erro ao criar o arquivo:', error);
            reject(error);
        });
        fileStream.on('finish', () => {
            console.log('Arquivo criado com sucesso:', filePath);
            resolve();
        });

        references.forEach((ref) => {
            fileStream.write(`Link: ${ref.link}\nTitle: ${ref.title}\nAuthor: ${ref.author}`);
            fileStream.write('------------------------\n');
        });

        console.log('Escrevendo dados no arquivo');
        fileStream.end();
    });
}

module.exports = { generateFile }