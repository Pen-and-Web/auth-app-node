const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true, dropDups: true },
  role: { type: String, required: true },
  secret_answer: { type: String, required: true }
});

module.exports = mongoose.model("users", usersSchema);
