const openai = require("./service/openai");

async function generateSearchTerms(tema) {
    const prompt = `
    Gerar 15 (quinze) termos de pesquisa para o tema: ${tema}
    Importante: NÃO faça nenhum tipo de comentario, seu trabalho é unicamente gerar os 15 termos de pesquisa
    Importante: Use \\n entre cada termo para facilitar o processamento posterior
    `;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0,
    });

    const terms = response.choices[0].message.content;
    const content = terms.split(terms.includes('\\n') ? '\\n' : '\n').filter(term => term.trim() !== '');
    return content;
}

module.exports = { generateSearchTerms }