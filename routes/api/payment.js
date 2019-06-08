const mongoose = require('mongoose');
const passport = require('passport');
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
let ejs = require('ejs');
const helper = require('./helper');
const querystring = require('querystring');
const jwt = require('express-jwt');
var qr = require('qr-image');
const log = require('../logger');


router.post('/order', auth.required, async (req, res, next) => {
    const { payload: { id } } = req;
    const data = req.body;
    data.platformId=id;
    const platform= await Platforms.findById(id).then((platform) => (platform) ).catch((errr)=>{return false;});;

    if(!platform){
        log.error(`platform finding  ${id} status not loggedin`);
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    if(platform.length < 1){
        log.error(`platform finding  ${id} status not loggedin`);
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    const Order = await helper.createOrder(data);

    if(Order.status == false){
        log.error(`Order created  failded ${id} status ${Order.status} data ${Order.data.toString()} `);
        return res.status(200).json({
            status:false,
            data: 'Error while creating order',
        });
    }
    if(Order.status == true){
        log.info(`Order created   ${id} status ${Order.status} data ${Order.data._id.toString()} `);
        return res.status(200).json({
            status:true,
            data: Order.data,
        });
    }
    log.error(`Order creation failed `);
    return res.status(200).json({
        status:false,
        data: 'Error while creating order',
    });

});
router.post('/order/status/:id', auth.required, async (req, res, next) => {
    const { payload: { id } } = req;
    const data = req.body;
    data.platformId=id;
    const platform= await Platforms.findById(id).then((platform) => (platform) ).catch((errr)=>{return false;});;
    log.info(`platform finding   status ${platform.status} data ${id} `);
    if(!platform){
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    if(platform.length < 1){
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    const Order= await Orders.findById(req.params.id).then((Ordr) => (Ordr) );
    log.info(`Order finding   status ${Order.status} data ${req.params.id} `);
    if(Order.length < 1){
        return res.status(200).json({
            status:false,
            data: 'Order not found',
        });
    }
    return res.status(200).json({
        status:true,
        order:'order completed',
        payment: Order.status,
        storeOrderId: Order.storeOrderId,
    });
});

router.get('/qr/:text', function(req,res){
    var code = qr.image(req.params.text, { type: 'png', ec_level: 'H', size: 10, margin: 0 });
    res.setHeader('Content-type', 'image/png');
    code.pipe(res);
});
router.get('/rate/', async (req,res) => {
    var rate = await helper.rate();
    console.log('rate',rate.status);
    return res.status(200).json({
        status:true,
        rate:rate.data,
    });
});

router.get('/confirm/:id', async (req, res, next) => {
        const Order= await Orders.findById(req.params.id).then((Ordr) => (Ordr) ).catch((errr)=>{return false;});


        if(!Order){
            log.error(`Order finding  ${req.params.id} status ${Order.status} error ${Order.data} `);
            res.render('pages/error',{error:Order});
            return false;
        }
        if(Order.length < 1){
            log.error(`Order finding  ${req.params.id} status ${Order.status} error ${Order.data} `);
            return res.render('pages/error',{error:Order});
        }
         const formData= {
                email: Order.email,
                orderId: Order._id.toString(),
            };
         const address = await  helper.createAddress(formData);

             log.info(`created  address  ${address.data} status ${address.status}  `);
            if(address.status ==false){
                log.error(`created  address failed for  ${formData.toString()} status ${address.status} error ${address.data} `);
               return res.render('pages/error',{error:address});
            }


            const pageData= {
                coin : Order.coin,
                address :address.data[0].address,
                orderId:req.params.id,
                order:Order
            }
            var addressToUpdate = {
                id: req.params.id,
                data: {address: address.data[0].address},
            };
            const updateOrder= await helper.updateOrder(addressToUpdate);
            if(!updateOrder) {
                log.error(`order update with address for id ${req.params.id} address ${address.data[0].address}`);
               return  res.render('pages/error',{error:updateOrder});
            }
        res.render('pages/payment',pageData);
});
router.get('/checkbalance/:id', async (req, res, next) => {
    const id =req.params.id;
        const Order= await Orders.findById(req.params.id).then((Ordr) => (Ordr) ).catch((errr)=>{return false;});;
        if(!Order){
            return res.status(200).json({
                status:false,
                data: 'Order not found',
            });
        }
        if(Order.length < 1){
            return res.status(200).json({
                status:false,
                data: 'Order not found',
            });
        }
        console.log('Order.expire',Order.expire);
        console.log('Date.now()',Date.now());
        log.info('Order.expire',Order.expire);
        const expireIn =  (((parseInt(Order.expire, 10)+(60*30*1000)) - Date.now())/1000);
        console.log('expireIn',expireIn);
        if(expireIn < 1){
            log.info(`order expired with     ${Order} `);
            return res.status(200).json({
                status:true,
                expire: true,
                expireIn:expireIn,
                data: 'Order expired',
               redirect :`${Order.cancelUrl}orderId=${id}`,
                //redirect :`${Order.successUrl}orderId=${id}`,
            });
        }
         const formData= {
                email: Order.email,
             orderId: Order._id.toString(),
            };
         const getbalance = await  helper.getbalance(formData);
            console.log('getbalance',getbalance);
            log.info(`order time bal check with     ${getbalance} `);
            if(getbalance.status ==false){
                return res.status(200).json(getbalance);
            }
            if(getbalance.status ==true){
                log.info(`getbalance ${getbalance}`);


                if(parseFloat(getbalance.data).toFixed(5) >= parseFloat(Order.coin).toFixed(5)){
                    const updateOrder= await helper.updateOrder({id:req.params.id,data:{status:true}});
                    log.info(`order update on payment done  bal check with     ${updateOrder} `);
                    if(updateOrder.status ==false) {
                        return res.status(200).json({
                            status: true,
                            expire: false,
                            expireIn: expireIn,
                            data: 'Order completed',
                            debug:updateOrder,
                            redirect: `${Order.successUrl}orderId=${id}`,
                        });
                    } if(updateOrder.status ==true) {
                        return res.status(200).json({
                            status: true,
                            expire: false,
                            expireIn: expireIn,
                            data: 'Order completed',
                            debug:updateOrder,
                            redirect: `${Order.successUrl}orderId=${id}`,
                        });
                    }
                }
                return res.status(200).json({
                    status:false,
                    expire: false,
                    expireIn:expireIn,
                    data: 'Waiting for transaction',
                    lkm:true,
                    debug:getbalance,
                });

            }

});

router.get('/payment', async (req, res, next) => {
    const getData= req.query;
    console.log('getData',getData);
    // try {
    //     console('getData.token',getData.token);
    //     var decoded = jwtt.verify(getData.token, 'secret');
    //     console('decoded',decoded);
        const platform= await Platforms.findById(getData.id).then((platform) => (platform) ).catch((errr)=>{return false;});;
        console.log('platform',platform);
        if(!platform){
            res.render('pages/error');
            return false;
        }
         if(platform.length < 1){
            res.render('pages/error');
            return false;
        }
         const formData= {
            email: getData.email,
             orderId: getData.orderId,
            pid: getData.id,
            };
         const address = await  helper.createAddress(formData);
            console.log('address',address);
            if(address.status ==false){
                res.render('pages/error');
            }

        const coin =getData.amount*0.0005;
        const pageData= {
                coin : coin,
                address :address.data[0],
            }
        res.render('pages/payment',pageData);
});
module.exports = router;