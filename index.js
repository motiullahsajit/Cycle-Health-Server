const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
// const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


app.use(cors());
app.use(express.json());
// app.use(fileUpload());
const port = process.env.PORT || 5055;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6a5a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  console.log('database connected')

  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, products) => {
        res.send(products)
      })
  });

  app.post('/addService', (req, res) => {
    const newService = req.body;
    servicesCollection.insertOne(newService)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/reviews', (req, res) => {
    reviewsCollection.find({})
      .toArray((err, products) => {
        res.send(products)
      })
  });


  app.post('/addReview', (req, res) => {
    const newReview = req.body;
    reviewsCollection.insertOne(newReview)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });


  app.get('/', (req, res) => {
    res.send('database connected')
  })

});



app.listen(port);