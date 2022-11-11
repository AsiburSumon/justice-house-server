const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware Here
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jbfysym.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(401).send({message: 'unauthorized access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run (){
    try{
        const serviceCollection = client.db('justiceHome').collection('services');
        const reviewCollection = client.db('justiceHome').collection('review');

        app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token})
        })

        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({_id: -1});
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({_id: -1});
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/services', verifyJWT, async(req, res) =>{
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service)
            res.send(result);
        });

        // review api are here
        app.get('/reviews', async(req, res) =>{
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        });

        app.get('/reviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await reviewCollection.findOne(query);
            res.send(service);
        });

        app.get('/allreviews', async(req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/allreviews', async(req, res) =>{
            let query = {};
            if(req.query.service){
                query = {
                    service: req.query.service
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        app.post('/reviews', async(req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews);
            res.send(result)
        });

        app.put('/reviews/:id', verifyJWT, async(req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const review = req.body.review;
            const option = {upsert: true};
            const updateReview = {
                $set: {
                    review: review
                }
            }
            const result = await reviewCollection.updateOne(filter, updateReview, option);
            res.send(result)
        })

        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally{

    }

}


run().catch(error => console.error(error));


app.get('/', (req, res) => {
    res.send("justice house server is running")
})

app.listen(port, ()=> {
    console.log(`Justice House server is Running on ${port}`)
})