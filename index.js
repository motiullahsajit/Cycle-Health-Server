const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const port = process.env.PORT || 5055;
const admin = require("firebase-admin");
const serviceAccount = require("./configs/cycle-health-firebase-adminsdk-oqdg0-fbfceb28a3.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6a5a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const bookingsCollection = client.db(`${process.env.DB_NAME}`).collection("bookings");
  const adminsCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
  const teamCollection = client.db(`${process.env.DB_NAME}`).collection("team");
  console.log('database connected')

  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, services) => {
        res.send(services)
      })
  });

  app.post('/addService', (req, res) => {
    const newService = req.body;
    servicesCollection.insertOne(newService)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.delete('/removeService/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    servicesCollection.deleteOne({ _id: id })
      .then(result => {
        res.send(result.deletedCount > 0);
      })
  })

  app.get('/service/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    servicesCollection.find({ _id: id })
      .toArray((err, service) => {
        res.send(service[0]);
      })
  });

  app.patch('/updateService/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    servicesCollection.updateOne({ _id: id },
      {
        $set: { name: req.body.name, price: req.body.price, description: req.body.description, imageURL: req.body.imageURL }
      })
      .then(result => {
        res.send(result.modifiedCount > 0)
      })
  })

  app.post('/addBooking', (req, res) => {
    const booking = req.body;
    bookingsCollection.insertOne(booking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/userBookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail === queryEmail) {
            bookingsCollection.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents)
              })
          }
          else {
            res.status(401).send('un-authorized access')
          }

        }).catch((error) => {
          res.status(401).send('un-authorized access')
        });
    }
    else {
      res.status(401).send('un-authorized access')
    }

  })

  app.get('/bookings', (req, res) => {
    bookingsCollection.find({})
      .toArray((err, bookings) => {
        res.send(bookings)
      })
  });

  app.get('/order/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    bookingsCollection.find({ _id: id })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  });

  app.patch('/updateStatus/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    bookingsCollection.updateOne({ _id: id },
      {
        $set: { status: req.body.status }
      })
      .then(result => {
        res.send(result.modifiedCount > 0)
      })
  })

  app.post('/makeAdmin', (req, res) => {
    const admin = req.body;
    adminsCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email: email })
      .toArray((err, admins) => {
        res.send(admins?.length > 0);
      })
  })

  app.get('/admins', (req, res) => {
    adminsCollection.find({})
      .toArray((err, admins) => {
        res.send(admins)
      })
  });

  app.delete('/removeAdmin/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    adminsCollection.deleteOne({ _id: id })
      .then(result => {
        res.send(result.deletedCount > 0);
      })
  })


  app.get('/team', (req, res) => {
    teamCollection.find({})
      .toArray((err, team) => {
        res.send(team)
      })
  });

  app.post('/addMember', (req, res) => {
    const newMember = req.body;
    teamCollection.insertOne(newMember)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.delete('/removeMember/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    teamCollection.deleteOne({ _id: id })
      .then(result => {
        res.send(result.deletedCount > 0);
      })
  })

  app.get('/reviews', (req, res) => {
    reviewsCollection.find({})
      .toArray((err, reviews) => {
        res.send(reviews)
      })
  });


  app.post('/addReview', (req, res) => {
    const newReview = req.body;
    reviewsCollection.insertOne(newReview)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.delete('/removeReview/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    reviewsCollection.deleteOne({ _id: id })
      .then(result => {
        res.send(result.deletedCount > 0);
      })
  })

  app.get('/', (req, res) => {
    res.send('database connected')
  })

});



app.listen(port);