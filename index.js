const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;

require('dotenv').config()

const app = express()
const port =  5000;
app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ryify.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db("DB_NAME").collection("test");
  const orderCollection = client.db("DB_NAME").collection("ordeaddrs");

  app.get('/product', (req, res) => {
    productCollection.find()
      .toArray((err, items) => {
        // console.log('from database', items)
        res.send(items);
      })

  })

  app.post('/addProduct', (req, res) => {
    const NewProduct = req.body;
    console.log('adding event', NewProduct);
    productCollection.insertOne(NewProduct)
      .then(result => {
        console.log('inserted count', result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  })


  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    orderCollection.insertOne(newOrder)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  
  app.delete("/deleteProduct/:id", (req, res) => {
		const id = ObjectId(req.params.id);
		productCollection.deleteOne({
			_id: ObjectId(`${req.params.id}`),
		}).then((result) => {
			console.log(result);
		});
	});

  app.get('/orders', (req, res) => {
    const queryEmail = req.query.email;
    orderCollection.find({ email: queryEmail })
      .toArray((err, docs) => res.send(docs))

  })

});



app.listen(process.env.PORT || port);