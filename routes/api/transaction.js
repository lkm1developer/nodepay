const mongoose = require('mongoose');
const crypto = require('crypto');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Platforms = mongoose.model('Platforms');
const Customers = mongoose.model('Customers');
const Orders = mongoose.model('Orders');
const Transactions = mongoose.model('Transactions');
const algorithm = 'aes-256-ctr';
const  password = 'd6F3Efeq';
const deepssh = require('../ssh');
let ejs = require('ejs');
const helper = require('./helper');
const querystring = require('querystring');
const jwt = require('express-jwt');
var qr = require('qr-image');
const log = require('../logger');

router.post('/:orderId', auth.required, async (req, res, next) => {
    const { payload: { id } } = req;
    var data = req.body;
    log.info(`request for transaction with order id ${req.params.orderId}`);
    data.platformId=id;
    const platform= await Platforms.findById(id).then((platform) => (platform) ).catch((errr)=>{return false;});;
    if(!platform){
        log.error(`request for transaction with order id ${req.params.orderId} Please Login`);
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    if(platform.length < 1){
        log.error(`request for transaction with order id ${req.params.orderId} Please Login`);
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    const Order =  await Orders.findById(req.params.orderId).then((order) => (order) ).catch((errr)=>{return false;});;
    if(!Order){
        log.error(`request for transaction with order id ${req.params.orderId} Order not found`);
        return res.status(200).json({
            status:false,
            data: 'Order not found',
        });
    }
    if(Order.length < 1) {
        log.error(`request for transaction with order id ${req.params.orderId} Order not found`);
        return res.status(200).json({
            status: false,
            data: 'Order not found',
        });
    }
    const Transaction =  await Transactions.find({orderId: req.params.orderId}).then((transaction) => (transaction) ).catch((errr)=>{return false;});;

    if(Transaction.length>0 ){
        log.info(`request for transaction with order id ${req.params.orderId} already done`);
        return res.status(200).json({
            status:true,
            already: true,
            data:Transaction,
            order:Order
        });
    }
    const datafor = {
            email : Order.email,
            orderId: req.params.orderId,
            address: data.address,
            coin: Order.coin
        }
    log.info(`request for transaction with order id ${req.params.orderId} ready for send coin ${datafor.toString()}`);
    var  sendCoin =  await helper.transferbalance(datafor,false);
    if(sendCoin.status == false) {
        log.error(`request for transaction with order id ${req.params.orderId} faild for  ${datafor.toString()} with error ${sendCoin.data.toString()}`);
        return res.status(200).json({
            status: false,
            data: sendCoin.data,
            already: false,
        });
    }
    log.info(`request for transaction with order id ${req.params.orderId} success for  ${datafor.toString()} with res ${sendCoin.data.toString()}`);

    var newTransaction = new Transactions();
    newTransaction.platformId = platform._id.toString();
    newTransaction.orderId = req.params.orderId;
    newTransaction.storeOrderId = Order.storeOrderId;
    newTransaction.coin = Order.coin;
    newTransaction.from = data.email;
    newTransaction.to = data.address;
    newTransaction.hash = sendCoin.data;
    newTransaction.Named = sendCoin.Named;
    newTransaction.fromaddress=Order.address,
    newTransaction.date = Date.now();
    return newTransaction.save().then((newTrans)=> {
        log.info(`transaction with order id ${req.params.orderId} saved  `);

        return res.status(200).json({
            status: true,
            saved:true,
            data :{newTrans},
            sendCoin:sendCoin,
            already: false,

        });
    })
        .catch((err) => {
            log.error(`transaction with order id ${req.params.orderId} faild while storing  `);
            return res.status(200).json({
                status: false,
                data: err.toString(),
                sendCoin: sendCoin,
                already: false,
            });
        }
    );
    log.error(`transaction with order id ${req.params.orderId} here something wrong `);
    return res.status(200).json({
        status: false,
        data: 'something went wrong',
        sendCoin: sendCoin,
        already: false,
    });

});


module.exports = router;