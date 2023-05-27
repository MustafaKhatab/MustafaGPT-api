const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);


async function getChatGptResponse(message) {
  try{const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: message,
  });
  return response.data.choices[0].message;
}catch(error){
    console.error('ChatGPT API request error:', error);
    throw new Error('Failed to retrieve ChatGPT response'); 
}
}

module.exports = { getChatGptResponse };
