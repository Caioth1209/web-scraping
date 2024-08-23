const openai = require("./service/openai");

async function generateSearchTerms(userInput) {
    console.log('Gerando termos de pesquisa...');
    const prompt = `
    Gerar 20 (vinte) termos de pesquisa para o tema:${userInput}
    Importante: NÃO faça nenhum tipo de comentario, seu trabalho é unicamente gerar os 20 termos de pesquisa
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
    const content = terms.split('\n').filter(term => term.trim() !== '');
    console.log('Termos de pesquisa gerados:', content);
    return content;
}

module.exports = { generateSearchTerms }