const mongoose = require('mongoose');
const passport = require('passport');
const crypto = require('crypto');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Platforms = mongoose.model('Platforms');
const Customers = mongoose.model('Customers');
const algorithm = 'aes-256-ctr';
const  password = 'd6F3Efeq';
const deepssh = require('../ssh');
//POST new platform route (optional, everyone has access)

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const platform  = req.body;

  if(!platform.apiKey) {
    return res.status(200).json({
        status:false,
        data: 'apiKey is required',
        debug: platform,
    });
  }

  if(!platform.apiSecret) {
    return res.status(200).json({
        status:false,
        data: 'apiSecret is required',
    });
  }


  return passport.authenticate('api-local', { session: false }, (err, passportplatform, info) => {
    if(err) {
        return res.status(200).json({
            status:false,
            data: 'Credentials Invalid',
        });
    }

    if(passportplatform) {
      const platform = passportplatform;
      platform.token = passportplatform.generateJWT();

      return res.json({  status:true ,data: {platform: platform.toAuthJSON() }});
    }

    return status(400).info;
  })(req, res, next);
});


router.post('/platformnew', auth.required, async  (req, res, next) => {
    const { body: { platform } } = req;
    const { payload: { id } } = req;
        const Posted = req.body;

    const user= await Users.findById(id).then((user) => (user)).catch((errr)=>{return false;});;
    if(!user) {
        return res.status(200).json({
            status: false,
            data: 'Please Login',
        });
    }

    const finalplatform = new Platforms(platform);
    const uniqueString =`${user.email}${Posted.type}`;
    console.log('uniqueString',uniqueString);
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(uniqueString,'utf8','hex')
    crypted += cipher.final('hex');
    const IsExist =  await Platforms.find({apiKey :crypted}).then((data) => (data)).catch((errr)=>{return false;});;
    if(IsExist.length > 0) {
        const allPlatforn =  await Platforms.find({email :user.email}).then((data) => (data)).catch((errr)=>{return false;});;
        return res.status(200).json({
            status:true,
            data:allPlatforn,
            already:true
        });
    }


    const allPlatform =  await Platforms.find({email :user.email}).then((data) => (data));
    finalplatform.apiKey = crypted;
    finalplatform.apiSecret = crypto.randomBytes(16).toString('hex');
    finalplatform.email = user.email;
    finalplatform.userId = user._id.toString();
    finalplatform.type = req.body.type;
    finalplatform.apiSecret = crypto.randomBytes(16).toString('hex');
    finalplatform.setPassword(finalplatform.apiSecret);

     return finalplatform.save().then((pl)=>res.json({
         status: true,
         saved:true,
         data :allPlatform.concat(pl) ,
     })).catch((err) => res.json({
            status: false,
            data :err.toString() ,
        }));

    return res.status(200).json({
        status:true,
        data:allPlatform,
    });

});
router.post('/platformdelete', auth.required, async  (req, res, next) => {
    const { body: { platform } } = req;
    const { payload: { id } } = req;

    const Posted = req.body;
    const user= await Users.findById(id).then((user) => (user)).catch((errr)=>{return false;});;
    if(!user) {
        return res.status(200).json({
            status: false,
            data: 'Please Login',
        });
    }

    const IsExist = await Platforms.findById(Posted.id).then((data) => (data)).catch((errr)=>{return false;});
    if(IsExist) {
        const deleMe = await  Platforms.remove({ _id: req.body.id }).then((data) => (data)).catch((errr)=>{return false;});
        if (deleMe) {
            const myPlatforms =  await Platforms.find({userId :user._id.toString()}).then((data) => (data)).catch((errr)=>{return false;});;

            return res.status(200).json({
                status:true,
                data:myPlatforms,
            });
        }
        else {
            return res.status(200).json({
                status:false,
                data:err,
            });
        }
    };
    return res.status(200).json({
        status:false,
        data:'Something went wrong',
    });

});
router.post('/myplatforms', auth.required, async  (req, res, next) => {
    const { body: { platform } } = req;
    const { payload: { id } } = req;
        const Posted = req.body;
    const user= await Users.findById(id).then((user) => (user)).catch((errr)=>{return false;});;
    if(!user) {
        return res.status(200).json({
            status: false,
            data: 'Please Login',
        });
    }

    const myPlatforms =  await Platforms.find({userId :user._id.toString()}).then((data) => (data)).catch((errr)=>{return false;});;
       if(!myPlatforms) {
           res.json({
               status: false,
               data :'No Plaforms Registered' ,
           });
        }
        if(myPlatforms.length< 1){
               res.json({
                   status: false,
                   data :'No Plaforms Registered' ,
               });
        }
        res.json({
            status: true,
            data :myPlatforms,
        });

});

router.get('/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

return Platforms.findById(id)
    .then((platform) => {
    if(!platform) {
    return res.status(200).json({
        status:false,
        data: 'Please Login',
    });
}
return res.status(200).json({
    status:true,
    data: { platform: platform.toAuthJSON() }
});
// return res.json({ user: user.toAuthJSON() });
});
});

router.post('/address', auth.required, async (req, res, next) => {
    const { payload: { id } } = req;
    const platform =  await Platforms.findById(id).then((platform) =>(platform));
    if(!platform)  {
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    const customerData =req.body;

    const customer =  await Customers.find({email:customerData.email, apiKey:platform.apiKey}).then((customer) =>(customer));
    if(customer.length>0)  {
        return res.status(200).json({
            status:true,
            data: customer,
        });
    }
    const uniqueString = `${customerData.email}${platform.apiKey}`;
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(uniqueString,'utf8','hex')
    crypted += cipher.final('hex');
    const cmd= `cd /root/deeponion && ./DeepOniond getnewaddress ${crypted}`;
    const address =   await deepssh(cmd);

    const finalcustomer = new Customers();
    finalcustomer.email = customerData.email;
    finalcustomer.apiKey = platform.apiKey
    finalcustomer.address = address.replace(/[\n\t\r]/g,"");
    finalcustomer.meta = crypted;
    finalcustomer.balance = 0;
    return finalcustomer.save().then((cust)=>res.json({
        status: true,
        saved:true,
        data :cust ,
    }))
    .catch((err) => res.json({
            status: false,
            data :err.toString() ,
        }));

// return res.json({ user: user.toAuthJSON() });
});
router.post('/getbalance/', auth.required, async (req, res, next) => {
    const { payload: { id } } = req;
    const platform =  await Platforms.findById(id).then((platform) =>(platform));
    if(!platform)  {
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
    }
    const customerData =req.body;

    const customer =  await Customers.find({address:customerData.address, apiKey:platform.apiKey}).then((customer) =>(customer));
    if(customer.length<1)  {
        return res.status(200).json({
            status:false,
            data: 'customer not exist',
        });
    }
    const uniqueString = `${customerData.email}${platform.apiKey}`;
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(uniqueString,'utf8','hex')
    crypted += cipher.final('hex');
    const cmd= `cd /root/deeponion && ./DeepOniond getbalance ${crypted}`;
    const output =   await deepssh(cmd);

    // const finalcustomer = new Customers();
    // finalcustomer.email = customerData.email;
    // finalcustomer.apiKey = platform.apiKey
    // finalcustomer.address = address.replace(/[\n\t\r]/g,"");
    // finalcustomer.meta = '';
    // finalcustomer.balance = 0;
    return res.json({
        status: true,
        data :output.replace(/[\n\t\r]/g,""),
    });

// return res.json({ user: user.toAuthJSON() });
});

module.exports = router;