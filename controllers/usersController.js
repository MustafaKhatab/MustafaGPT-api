const User = require('../models/User')
const Chat = require('../models/Chat')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body

    // Confirm data
    if (!username || !password  || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicateUser = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicateUser) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

     // Check for duplicate email
    const duplicateEmail =  await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicateEmail) {
        return res.status(409).json({ message: 'Duplicate email' })
    }
     // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }


    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { username, "password": hashedPwd, email }

    // Create and store new user 
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
    const newChat = new Chat({
        user: user._id,
        title: "New Chat",
        messages: [],
      });
    
      // Save the new chat
      const savedChat = await newChat.save();
      if (!savedChat) {
        res.status(400).json({ message: "Invalid chat data received" });
      }
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, password,email } = req.body

    // Confirm data 
    if (!id || !username || !email) {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate =  await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.email = email

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Delete the user chats
    const chat = await Chat.findOne({ user: id }).lean().exec()
    if (chat) {
        await Chat.deleteOne({ _id: chat._id }); // Delete the chat using the model directly
  
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}