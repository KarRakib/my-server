const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 9000;
app.use(cors())
app.use(express.json());
require('dotenv').config()


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS}@cluster27.3snb0mf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
console.log(uri);
async function run() {
  try {

    const tasksCollection = client.db('Redux').collection('tasks')
    const computerCollection = client.db('Redux').collection('computer')
    const userCollection = client.db('Redux').collection('user')
    const jobsCollection = client.db('Redux').collection('jobs')

    app.post('/computer', async (req, res) => {
      const task = req.body;
      console.log(task);
      const result = await tasksCollection.insertOne(task);
      res.send(result)
    })
    app.get('/computer', async (req, res) => {
      const query = {};
      const result = await computerCollection.find(query).toArray();
      res.send(result)
    })


    app.patch('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const updatedTaskData = req.body;
      // const query = {_id : new ObjectId(id)}
      // const result = await tasksCollection.updateOne(query,{$set:updatedTaskData})

      try {
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedTaskData }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ error: 'Task not found' });
        } else {
          res.json({ message: 'Task updated successfully' });
        }
      } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query)
      res.send(result)
    })

    app.post('/user', async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data)
      res.send(result)
    });
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const result = await userCollection.findOne({ email })
      console.log(result);
      if (result?.email) {
        res.send({ status: true, data: result });
      } else {

        res.send({ status: false })
      }
    });

    app.get('/user', async (req, res) => {
      const query = {}
      const result = await userCollection.findOne(query)
      res.send(result)
    });
    app.post('/job', async (req, res) => {
      const data = req.body;
      const result = await jobsCollection.insertOne(data)
      res.send(result)
    });
    app.get('/jobs', async (req, res) => {
      const query = {};
      const result = await jobsCollection.find(query).toArray()
      res.send(result)
    });
    app.get('/job/:id', async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.findOne(query);
      res.send({ status: true, data: result })
    });
    app.patch('/apply', async (req, res) => {
      const userId = req.body.userId;
      const jobId = req.body.jobId;
      const email = req.body.email;
      const filter = { _id: new ObjectId(jobId) }
      const updateDoc = {
        $push: { applicants: { id: new ObjectId(userId), email } }
      };
      const result = await jobsCollection.updateOne(filter,updateDoc)
      if(result.acknowledged){
        return res.send({status:true, data:result})
      }
      res.send({ status:false})
    });
    app.get('/applied-jobs/:email',async(req, res)=>{
      const email = req.params.email;
      const query= {applicants:{$elemMatch:{email:email}}};
      const cursor = jobsCollection.find(query).project({applicants:0});
      const result = await cursor.toArray();
      res.send({status: true, data: result})
    });
    app.patch('/query', async(req,res)=>{
      const userId = req.body.userId
      const jobId = req.body.jobId
      const email = req.body.email
      const question = req.body.question;
      console.log(userId, jobId, email);
      const filter ={_id : new ObjectId(jobId)};
      const updateDoc ={
        $push:{
          queries:{ id: new ObjectId(userId),
          email,
          question: question,
          reply:[],
        },
      },
      };
      const result = await jobsCollection.updateOne(filter, updateDoc)
      if (result?.acknowledged) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    })
  }
  finally {

  }
}
run().catch(error => console.log(error))

app.get('/', (req, res) => {
  res.send('Hi i am Redux Server Here!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})