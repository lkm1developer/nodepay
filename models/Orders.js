const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrdersSchema = new Schema({
    email: String,
    total:String,
    cancelUrl:String,
    successUrl:String,
    storeOrderId:String,
    address:String,
    platformId:String,
    coin:String,
    status: Boolean,
    expire:String,
    NamedAddress: String,
    orderInfo:[],
});


mongoose.model('Orders', OrdersSchema);