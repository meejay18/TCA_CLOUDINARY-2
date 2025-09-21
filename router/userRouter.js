const express = require('express')
const { signUp, updateUser, getAllUsers, deleteUser } = require('../controller/userController')
const upload = require('../middleware/multer')

const router = express.Router()

const signUpfield = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
])

router.post('/user', signUpfield, signUp)
router.put('/user/:userId', signUpfield, updateUser)
router.get('/user', getAllUsers)
router.get('/user/:userId', getOneUser)
router.delete('/user/:userId', deleteUser)

module.exports = router
