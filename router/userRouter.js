const express = require('express')
const { signUp, updateUser } = require('../controller/userController')
const upload = require('../middleware/multer')

const router = express.Router()

const signUpfield = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
])

router.post('/user', signUpfield, signUp)
router.put('/user/:userId', signUpfield, updateUser)

module.exports = router
