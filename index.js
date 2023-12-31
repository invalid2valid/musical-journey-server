const express = require("express");
const { ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 8000;
require("dotenv").config();
const app = express();
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");

console.log(process.env.DB_NAME); // remove this after
console.log(process.env.DB_PASS); // remove this after

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.y4uhtgw.mongodb.net/?retryWrites=true&w=majority`;

const hello = {
  hello: "Server is running",
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
    //colections list
    const classesCollection = client.db("summer-school").collection("classes");
    const usersCollection = client.db("summer-school").collection("users");
    const selectedCollection = client
      .db("summer-school")
      .collection("selectedClasses");

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //CRUD
    //get all classes sorted
    app.get("/classes", async (req, res) => {
      const result = await classesCollection
        .find()
        .sort({ students: -1 })
        .toArray();
      res.send(result);
    });
    //get all approved classes
    app.get("/classesapproved", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollection
        .find(query)
        .sort({ students: -1 })
        .toArray();
      res.send(result);
    });

    // add selected class class api
    app.post("/addselectedclass", async (req, res) => {
      const newData = req.body;
      // const db = await selectedCollection
      await selectedCollection
        .insertOne(newData)
        .then(() => {
          res.status(201).json({ message: "Data created successfully" });
        })
        .catch((error) => {
          res.status(500).json({ error: "Internal Server Error" });
        });

      // res.send(result);
    });
    // add class
    app.post("/addclass", async (req, res) => {
      const newData = req.body;
      // const db = await selectedCollection
      await classesCollection
        .insertOne(newData)
        .then(() => {
          res.status(201).json({ message: "Data created successfully" });
        })
        .catch((error) => {
          res.status(500).json({ error: "Internal Server Error" });
        });

      // res.send(result);
    });
    //get all user api
    app.get("/user", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    //get a user role
    app.get("/getrole/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      const result = await usersCollection.findOne(query);

      res.send(result);
    });
    //get selected user email
    app.get("/selectedclasses/:email", async (req, res) => {
      const email = req.params.email;
      const query = { student_email: email };
      const result = await selectedCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/user/instructors", async (req, res) => {
      const query = { role: "instructor" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    /**
     * get isctractor class
     *
     */
    app.get("/insclasses/:email", async (req, res) => {
      const email = req.params.email;
      const query = { instructor_email: email };
      const result = await classesCollection.find(query).toArray();
      res.send(result);
      // console.log(result);
    });

    app.patch("/classstatus/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.query.status;
      console.log("id:", id);
      console.log(status);
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const update = { $set: { status: status } };
      const result = await classesCollection.updateOne(query, update);
      res.send(result);
    });
    //patch updaterole
    app.patch("/user/updaterole", async (req, res) => {
      const role = req.query.role;
      const email = req.query.email;
      const query = { email: email };
      const update = { $set: { role: role } };
      const result = await usersCollection.updateOne(query, update);
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
    //delete classes
    app.delete("/selectedclasses/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id:", id);
      const objectId = new ObjectId(id); // Convert id to ObjectID
      const result = await selectedCollection.deleteOne({
        _id: objectId,
      });
      res.send(result);
      console.log(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}

app.get("/", (req, res) => {
  res.send(hello);
});
app.get("/hello", (req, res) => {
  res.send({ hi: "hi" });
});

app.listen(port, () => {
  console.log(`server is running port ${port}`);
});

// console.log(process.env.DB_NAME); // remove this after

run().catch(console.dir);
