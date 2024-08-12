const express = require("express");
const { scrapeLogic } = require("./src/scrapeLogic");
const path = require('path');
const os = require("os");
const { generateSearchTerms } = require("./src/generateSearchTerms");
const { uploadFile } = require("./src/uploadFile");
const { generateFile } = require("./src/generateFIle");
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json())

app.post("/scrape", async (req, res) => {

  const { temaTcc } = req.body

  try {
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, 'referencias.pdf');

    const terms = await generateSearchTerms(temaTcc)

    let allReferences = [];
    for (const term of terms) {
      const references = await scrapeLogic(term);
      allReferences = allReferences.concat(references);

      // Pausa de 10 segundos entre as solicitações para evitar bloqueios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await generateFile(allReferences, filePath);
    const file = await uploadFile(filePath)

    res.send({ fileId: file });
  } catch (error) {
    res.send({ error: error.message })
  }

});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
