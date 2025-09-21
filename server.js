const express = require('express')
require('./config/database')
const app = express()
app.use(express.json())
const PORT = process.env.PORT

const userRouter = require('./router/userRouter')
app.use(userRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
