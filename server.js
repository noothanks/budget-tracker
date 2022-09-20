const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3001;
const MONGODB_URI = 'mongodb+srv://noothanks:Unitas1108%21@cluster0.ouzb9zf.mongodb.net/?retryWrites=true&w=majoritymongodb+srv://noothanks:Unitas1108%21@cluster0.ouzb9zf.mongodb.net/?retryWrites=true&w=majority' || "mongodb://localhost/budget";

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});