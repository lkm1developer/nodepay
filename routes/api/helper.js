const mongoose = require('mongoose');
const crypto = require('crypto');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Platforms = mongoose.model('Platforms');
const Customers = mongoose.model('Customers');
const Orders = mongoose.model('Orders');
const algorithm = 'aes-256-ctr';
const  password = 'd6F3Efeq';
const deepssh = require('../ssh');
const deepssh2 = require('../ssh2');
var request = require("request");
const fetch = require('node-fetch');
const log = require('../logger');





exports.createAddress = async (data)=> {



    const uniqueString = `${data.email}${data.orderId}`;
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(uniqueString,'utf8','hex')
    crypted += cipher.final('hex');
    const customer =  await Customers.find({meta:crypted}).limit(1).sort({$natural:-1}).then((customer) =>(customer));
    if(customer.length>0)  {
        return ({
            status:true,
            data: customer,
        });
    }
    const cmd= `cd /root/deeponion && ./DeepOniond getnewaddress ${crypted}`;
    log.info(`creating address  ${cmd}`);
    const address =   await deepssh2(cmd);
    if(!address.status){
        log.info(`creating address faild ${address.toString()}`);
        return address;
    }
    log.info(`creating address success ${address.toString()}`);
    const finalcustomer = new Customers();
    finalcustomer.email = data.email;
    finalcustomer.apiKey = data.apiKey
    finalcustomer.address = address.data.replace(/[\n\t\r]/g,"");
    finalcustomer.meta = crypted;
    finalcustomer.balance = 0;
    return finalcustomer.save().then((cust)=>({
        status: true,
        saved:true,
        data :[cust] ,
    }))
    .catch((err) => ({
            status: false,
            data :err.toString() ,
        }));
  return   {
        status: false,
        data :'Something went wrong',
    };

};

exports.getbalance= async(data)=> {
    const uniqueString = `${data.email}${data.orderId}`;
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(uniqueString,'utf8','hex')
    crypted += cipher.final('hex');
    const cmd= `cd /root/deeponion && ./DeepOniond getbalance ${crypted}`;
    log.info(`checking balance order  ${cmd}`);
    const output =   await deepssh(cmd);
    return ({
        status: true,
        data :output.replace(/[\n\t\r]/g,""),
    });

}
exports.transferbalance= async(data)=> {
    console.log('transferbalance',data);
    const uniqueString = `${data.email}${data.orderId}`;
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(uniqueString,'utf8','hex')
    crypted += cipher.final('hex');
       const  cmd=  `cd /root/deeponion && ./DeepOniond  sendfrom ${crypted} ${data.address}  ${data.coin}`;
    log.info(cmd);
    const output =   await deepssh2(cmd);
    if(output.status == true) {
        return {
            status: true,
            data: output.data,
            Named :crypted
        };
    }
    if(output.status == false) {
        return {
            status: false,
            data: output.data,
        };
    }

}
exports.rate= async()=> {
   return fetch('https://api.coinmarketcap.com/v2/ticker/1881/')
        .then(res => res.json())
        .then(json => {
            var  price= json.data.quotes.USD.price;
            console.log('price',price);
            return   {
                status: true,
                data :price,
            };
        }).catch((err) => {
            return   {
                status: false,
                data :'Something went wrong',
            };
        });
}
exports.createOrder = async (data)=> {
    var rateApi = await this.rate();
    let rate =0.1400719671;
    if(rateApi.status ==true){
        rate =rateApi.data
    }
    const order = new Orders();
    order.email = data.email;
    order.total = data.total;
    order.cancelUrl = data.cancelUrl;
    order.successUrl = data.successUrl;
    order.storeOrderId = data.order_id;
    order.status = false;
    order.address = '';
    order.coin = (data.total/rate).toFixed(6);
    order.expire = Date.now();
    order.NamedAddress ='';
    order.platformId =data.platformId;
    order.orderInfo = (data);
    log.info(`creating order  ${order.toString()}`);
    return order.save().then((ordr)=>({
        status: true,
        saved:true,
        data :ordr ,
    }))
.catch((err) => ({
        status: false,
        data :err.toString() ,
    }));
    return   {
        status: false,
        data :'Something went wrong',
    };

};

exports.updateOrder = async (data)=> {
    const id = data.id;
    const toUpdate=data.data;
    log.info(`updating  ${id} Orders by  `+toUpdate.toString());
   return await   Orders.findByIdAndUpdate(id,toUpdate,
    {new: false},
    (err, todo) => {
        // Handle any possible database errors
        if (err) {
            log.error(`Something wrong when Orders.findByIdAndUpdateupdating data `+id);
            return {
                 status: false,
                 data :err.toString() ,
             }
        };
    log.info(`updation success Orders.findByIdAndUpdateupdating data `+id);
    return   { status: true, data:id };

    }
);
  //  return updated;
   //  console.log('when updating data',data);
   // const updated= await Orders.findOneAndUpdate({id: data.id}, {$set:{status:true}}, {new: true}, (err, doc) => {
   //      if (err) {
   //          console.log("Something wrong when updating data!");
   //         return {
   //              status: false,
   //              data :err.toString() ,
   //          }
   //      }
   //      console.log('doc',doc);
   //      });
   // console.log('updated',updated)
   //  return   { status: true, data:updated };

};