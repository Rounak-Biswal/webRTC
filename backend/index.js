const express = require('express')
const cors = require('cors')

const port = 8100
const app = express()

app.use(express.cors())
app.use(express.json())

app.listen(port, ()=>{
    console.log('server live at ',port );
})