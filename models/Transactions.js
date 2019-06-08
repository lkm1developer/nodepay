const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionsSchema = new Schema({
    platformId:String,
    orderId:String,
    storeOrderId:String,
    coin: String,
    from: String,
    to: String,
    hash: String,
    fromaddress:String,
    date: String,
    Named: String,
});


mongoose.model('Transactions', TransactionsSchema);