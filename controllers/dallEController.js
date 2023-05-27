const asyncHandler = require("express-async-handler");
const { getDallEResponse } = require("../dallE");

const handleUserMessage = asyncHandler(async (req, res) => {
  const message = req.params.message; 
  console.log(message);
  
  try {
    const dallEResponse = await getDallEResponse(message);
    return res.json({ url: dallEResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve DallE response" });
  }
});

module.exports = {
  handleUserMessage,
};
