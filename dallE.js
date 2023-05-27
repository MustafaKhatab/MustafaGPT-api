const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);


async function getDallEResponse(message) {
  try{const response = await openai.createImage({
    prompt: message,
    n: 1,
    size: "256x256",
  }); 
  return response.data.data[0].url;
}catch(error){
    console.error('DallE API request error:', error);
    throw new Error('Failed to retrieve DallE response'); 
}
}

module.exports = { getDallEResponse };
