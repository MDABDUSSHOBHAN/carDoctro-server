const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_PASS);
//This is for MongoDB


const uri = `mongodb+srv://${process.env.DB_USERS}:${process.env.DB_PASS}@cluster0.wfrv5va.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  const verifyJWT = (req, res, next) =>{

console.log('hitting verify JWT');

console.log(req.headers.authorization);
const authorization = req.headers.authorization;

if(!authorization){
   
  return res.status(401).send({error: true, message: 'unauthorization User'})
}
const token = authorization.split(' ')[1];

console.log('token inside Verify JWT', token);
jwt.verify(token, process.env.BD_Hex, (error,decoded) =>{

  if(error) {
    return res.status(403).send({error: true, message: ' unauthorize user'})
  }
  req.decoded = decoded;
  next();
})




  }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("car-doctor");
    const serviceCollection = database.collection("services");
    const bookingCollection = client.db('carDoctor').collection('bookings');

//jwt routes 
//Here  i generat the jst token for secrect jwt server token//
app.post('/jwt', (req, res) =>{

  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.BD_Hex,{
    expiresIn: '1h'
  })
  res.send({token});
})


   //services route//
    app.get('/services', async(req, res) =>{

      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async(req,res) =>{

      const id = req.params.id;
      const query ={_id:new ObjectId(id)}
     
      const options = {
        // Sort matched documents in descending order by rating
        sort: { "imdb.rating": -1 },
        // Include only the `title` and `imdb` fields in the returned document
        projection: {  title: 1, imdb: 1 , price:1,service_id:1,img:1 },
      };


      const result = await serviceCollection.findOne(query,options);
      res.send(result);
    })


      // bookings
      app.get('/bookings', verifyJWT, async(req, res) =>{

        //  console.log(req.headers.authorization);
         decoded = req.decoded;
        console.log('came back after verify!',decoded);
        if(decoded.email !== req.query.email){

          return res.send({error:1, message:'forbidden-acces'})
        }
         let query ={};
         if(req.query?.email){
  
           query = {email:req.query.email}
         }
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      })

    // boooking Sections

    app.post('/bookings', async(req, res) =>{

      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);

    })
    
    
app.delete('/bookings/:id', async(req, res) =>{

  const id = req.params.id;
  const query ={_id: new ObjectId(id)}
  const result = await bookingCollection.deleteOne(query);
  res.send(result);

})

app.patch('/bookings/:id', async(req, res) =>{

  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
  
  const updatedBooking = req.body;
  console.log(updatedBooking);
  const updateDoc = {

    $set: {
      status: updatedBooking.status
    }
  };
  const result = await bookingCollection.updateOne(filter,updateDoc);

  res.send(result);
 

})




  
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send(' Abdus_Shobhan Hello World xxxxxxxxxxx!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})