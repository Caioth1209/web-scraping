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
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, 'referencias.pdf');

    const terms = await generateSearchTerms(temaTcc)
    /*const terms = [
      'Abordagem do enfermeiro em casos de violência sexual  ',
      'Cuidados de enfermagem para vítimas de violência sexual  ',
      'Intervenções de enfermagem para mulheres agredidas  ',
      'Acolhimento de mulheres vítimas de violência sexual  ',
      'Protocolos de atendimento de enfermeiros a vítimas de violência  ',
      'Formação de enfermeiros em violência sexual  ',
      'Empatia no atendimento a mulheres vítimas de violência  ',
      'Impacto da violência sexual na saúde da mulher  ',
      'Estratégias de comunicação do enfermeiro com vítimas de violência  ',
      'Aspectos éticos na abordagem do enfermeiro a vítimas de violência  ',
      'Importância do suporte psicológico no atendimento de enfermagem  ',
      'Prevenção da violência sexual: papel do enfermeiro  ',
      'Sensibilização dos profissionais de saúde sobre violência sexual  ',
      'Rede de apoio para mulheres vítimas de violência: papel do enfermeiro  ',
      'Capacitação em saúde mental para enfermeiros que atendem vítimas  ',
      'Desafios enfrentados por enfermeiros no atendimento a vítimas de violência  ',
      'Experiência da mulher no atendimento de enfermagem após violência sexual  ',
      'Direitos das mulheres vítimas de violência e o papel do enfermeiro  ',
      'Atendimento multidisciplinar a mulheres vítimas de violência sexual  ',
      'Estudo sobre a percepção das enfermeiras em relação à violência sexual  '
    ]*/

    let allReferences = [];
    for (const term of terms) {
      const references = await scrapeLogic(term,);
      allReferences = allReferences.concat(references);

      // Pausa de 10 segundos entre as solicitações para evitar bloqueios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

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
