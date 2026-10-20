const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/studentDB");

// Schema
const Student = mongoose.model("Student", {
  name: String,
  rollNo: Number,
  branch: String
});

app.post("/add", async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json({ message: "Student Added" });
});


app.get("/students", async (req, res) => {
  const data = await Student.find();
  res.json(data);
});


app.delete("/delete/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});