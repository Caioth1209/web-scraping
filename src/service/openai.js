const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
    dangerouslyAllowBrowser: true
});

module.exports = openai