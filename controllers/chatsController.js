const Chat = require("../models/Chat");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { getChatGptResponse } = require("../chatGPT");

const handleUserMessage = asyncHandler(async (req, res) => {
  //get new user message from the body
  message = req.body;
  //check if the chat exists
  const chatId = req.params.chatId;
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  chat.messages.push(message);
  const prompt = chat.messages;

  // Send user message to ChatGPT API
  try{

  
  const chatGptResponse = await getChatGptResponse(prompt);
  
  // Prepare the chatbot response object
  const botResponse = {
    role: "assistant",
    content: chatGptResponse.content,
  };

  // Add the chatbot response to the chat messages
  // and save the updated chat document

  chat.messages.push(botResponse);
  if (chat.title === "New Chat") {
    if (message.content.length > 20) {
      chat.title = message.content.slice(0, 20) + "...";
    } else {
      chat.title = message.content;
    }
  }
  await chat.save();

  // Return the chatbot response to the client
  res.json(chat);
}
catch(error){
  return res.status(500).json({ message: "Failed to retrieve ChatGPT response" });

}

});

const handleUserMessageAndCreation = asyncHandler(async (req, res) => {
  const message = req.body;
  
  const prompt = {role: "user", content: message.content };
  console.log(prompt)
  // Check if the user exists
  const userExists = await User.findById(message.userId).lean().exec();
  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }



  try{
  // Send user message to ChatGPT API
  const chatGptResponse = await getChatGptResponse([prompt]);

  // Prepare the chatbot response object
  const botResponse = {
    role: "assistant",
    content: chatGptResponse.content,
  };

  // Create a new chat
  const newChat = new Chat({
    user: message.userId,
    title: message.content,
    messages: [prompt,botResponse],
  });

  // Save the new chat
  const savedChat = await newChat.save();
  if (savedChat) {
    //created
    res.status(201).json(savedChat);
  } else {
    res.status(400).json({ message: "Invalid chat data received" });
  }
}catch(error){
  return res.status(500).json({ message: "Failed to retrieve ChatGPT response" });

}
});

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find().lean();

  // If no chats
  if (!chats?.length) {
    return res.status(400).json({ message: "No chats found" });
  }

  // Add username to each chat before sending the response
  const chatsWithUser = await Promise.all(
    chats.map(async (chat) => {
      const user = await User.findById(chat.user).lean().exec();
      return { ...chat, username: user.username };
    })
  );

  res.json(chatsWithUser);
});

const getUserChats = asyncHandler(async (req, res) => {
  // Get the userId from the request body
  const userId = req.params.userId;
  // Find the user based on the userId
  const user = await User.findOne({ _id: userId }).lean().exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Find the chats for the user
  const chats = await Chat.find({ user: user._id }).lean();

  // If no chats found for the user
  if (!chats.length) {
    return res.status(400).json({ message: "No chats found for the user" });
  }

  res.json(chats);
});

// @desc Create new chat
// @route POST /chats
// @access Private
const createNewChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  // Check if the user exists
  const userExists = await User.findById(userId).lean().exec();
  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }

  // Create a new chat
  const newChat = new Chat({
    user: userId,
    title: "New Chat",
    messages: [],
  });

  // Save the new chat
  const savedChat = await newChat.save();
  if (savedChat) {
    //created
    res.status(201).json(savedChat);
  } else {
    res.status(400).json({ message: "Invalid chat data received" });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateChat = asyncHandler(async (req, res) => {
  const { id, title, messages } = req.body;
  if (!id) {
    return res.status(400).json({ message: "id required" });
  }
  // Check if the chat exists
  const chat = await Chat.findById(id);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Update the chat properties
  chat.title = title || chat.title;
  chat.messages = messages || chat.messages;

  // Save the updated chat
  const updatedChat = await chat.save();

  res.json({ chat: updatedChat });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteChat = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Check if the chat exists
  const chat = await Chat.findById(id);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Delete the chat
  const result = await chat.deleteOne();

  const reply = `chat with ID ${result._id} from UserID${result.user} deleted`;

  res.json(reply);
});

module.exports = {
  handleUserMessage,
  handleUserMessageAndCreation,
  getAllChats,
  getUserChats,
  createNewChat,
  updateChat,
  deleteChat,
};
