const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware Here
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("justice house server is running")
})

app.listen(port, ()=> {
    console.log(`Justice House server is Running on ${port}`)
})