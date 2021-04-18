const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const port = process.env.PORT || 4200;


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World! Welcome to BackEnd Development')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zvgp5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const packagesCollection = client.db(process.env.DB_NAME).collection("packages");
  const bookingsCollection = client.db(process.env.DB_NAME).collection("bookings");
  const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");
  const adminCollection = client.db(process.env.DB_NAME).collection("admins");

  console.log(err);

  // API for add package to the Database
  app.post('/addPackage', (req, res) => {
    const newPackage = req.body;
    console.log('adding new package: ', newPackage)
    packagesCollection.insertOne(newPackage)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // API for get packages Collection from the Database
  app.get('/packages', (req, res) => {
    packagesCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  // Load package according to package ID API
  app.get('/package/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    packagesCollection.find({ _id: id })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })

  // API for delete a package from the database
  app.delete('/deletePackage/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log(id);
    packagesCollection.findOneAndDelete({ _id: id })
      .then(documents => res.send(!!documents.value))
  })

  // API for save client books
  app.post('/addbooking', (req, res) => {
    const bookingData = req.body;
    bookingsCollection.insertOne(bookingData)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // api for load all the bookings 
  app.get('/bookings', (req, res) => {
    bookingsCollection.find()
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // api for load the bookings according to the loggedin Customer
  app.get('/bookingsOfCustomer', (req, res) => {
    bookingsCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // API for add reviews to the Database
  app.post('/addReview', (req, res) => {
    const review = req.body;
    console.log('adding new reveiew: ', review)
    reviewsCollection.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // API for get reviews Collection from the Database
  app.get('/reviews', (req, res) => {
    reviewsCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  // API for make anyone with email an admin
  app.post('/addAdmin', (req, res) => {
    const email = req.body;
    console.log('adding new admin: ', email)
    adminCollection.insertOne(email)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  // API for filter data according to the Admin
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0);
      })
  })

});



app.listen(port, () => console.log('listening to port 4200'))