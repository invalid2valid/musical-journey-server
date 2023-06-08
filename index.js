const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 8000;
const app = express();
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");

// summerschool
// q4JfXxWc4Pxspbdw
const uri =
  "mongodb+srv://summerschool:q4JfXxWc4Pxspbdw@cluster0.y4uhtgw.mongodb.net/?retryWrites=true&w=majority";

const helo = {
  helo: "Server is running",
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// database func
async function run() {
  try {
    //colections
    const classesCollection = client.db("summer-school").collection("classes");
    const usersCollection = client.db("summer-school").collection("users");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //CRUD
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}

app.get("/", (req, res) => {
  res.send(helo);
});

app.listen(port, () => {
  console.log(`server is running port ${port}`);
});

run().catch(console.dir);