const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("bson");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdiiu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World! vlo aso");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const AddServiceCollection = client.db("salon").collection("service");
  const reviewCollection = client.db("salon").collection("review");
  const NewBookingCollection = client.db("salon").collection("newBooking");
  const AdminCollection = client.db("salon").collection("admin");

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const description = req.body.description;
    const service = req.body.service;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    AddServiceCollection.insertOne({ description, service, image }).then(
      (result) => {
        res.send(result.insertedCount > 0);
      }
    );
  });

  app.get("/service", (req, res) => {
    AddServiceCollection.find({}).toArray((err, result) => {
      res.send(result);
    });
  });

  app.get("/service/:id", (req, res) => {
    AddServiceCollection.find({ _id: ObjectId(req.params.id) }).toArray(
      (err, result) => {
        res.send(result);
      }
    );
  });
  app.delete("/service/:id", (req, res) => {
    AddServiceCollection.deleteOne({ _id: ObjectId(req.params.id) }).then(
      (result) => {
        res.send(result.deletedCount > 0);
        res.redirect("http://localhost:3000/Manageservice");
      }
    );
  });

  app.post("/addBookingList", (req, res) => {
    const newBooking = req.body;
    NewBookingCollection.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/BookingList", (req, res) => {
    NewBookingCollection.find({}).toArray((err, result) => {
      res.send(result);
    });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/review", (req, res) => {
    reviewCollection.find({}).toArray((err, result) => {
      res.send(result);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    AdminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });
});

app.listen(process.env.PORT || port);
