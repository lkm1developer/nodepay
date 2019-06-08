const mongoose = require('mongoose');
const { Schema } = mongoose;

const CustomersSchema = new Schema({
    email: String,
    apiKey:String,
    address:String,
    meta:String,
    balance: String,
});


mongoose.model('Customers', CustomersSchema);