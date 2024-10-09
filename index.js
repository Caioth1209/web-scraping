const express = require("express");
const { scrapeLogic } = require("./src/scrapeLogic");
const path = require('path');
const os = require("os");
const { generateSearchTerms } = require("./src/generateSearchTerms");
const { uploadFile } = require("./src/uploadFile");
const { generateFile } = require("./src/generateFile");
const cors = require('cors')
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use(cors())

app.post("/referencias", async (req, res) => {

  const { temaTcc } = req.body

  try {

    if (!temaTcc) return res.status(500).send('Dados Invalidos');
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, 'referencias.pdf');

    const terms = await generateSearchTerms(temaTcc);

    let allReferences = [];
    const titlesSet = new Set();

    for (const term of terms) {
      const references = await scrapeLogic(term);

      for (const reference of references) {
        if (allReferences.length >= 20) {
          break;
        }
        if (!titlesSet.has(reference.title)) {
          titlesSet.add(reference.title);
          allReferences.push(reference);
        }
      }

      if (allReferences.length >= 20) {
        break;
      }

      // Pausa de 2 segundos entre as solicitações para evitar bloqueios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(allReferences);

    await generateFile(allReferences, filePath);
    const file = await uploadFile(filePath)

    return res.send({ fileId: file });
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
