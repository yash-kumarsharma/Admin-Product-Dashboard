const mongoose = require("mongoose");

let productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    image: String
})

module.exports = mongoose.model("products", productSchema);