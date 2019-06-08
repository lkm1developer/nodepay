const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
var validator = require("email-validator");
//POST new user route (optional, everyone has access)
router.get('/', auth.optional,  (req, res, next) => {


  return res.json('true');
});
router.post('/', auth.optional, async  (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(200).json({
      status:false,
      data: 'Email is required',
    });
  }

  if(!user.password) {
    return res.status(200).json({
        status:false,
        data: 'Password is required',
    });
  }

  const finalUser = new Users(user);
  const IsExist = await Users.find({email :user.email}).then((data) => (data));
     if(IsExist.length > 0) {
         return res.status(200).json({
             status:false,
             data: 'Email already taken ',
         });
     }
     if(!validator.validate(user.email)){
         return res.status(200).json({
             status:false,
             data: 'Email not valid',
             IsExist: IsExist,
         });
     }
      finalUser.setPassword(user.password);

      return finalUser.save()
        .then(() => res.json({
            status: true,
            data :{ user: finalUser.toAuthJSON() },
            }))
        .catch((err) => res.json({
                status: false,
                data :err.toString() ,
            }));
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(200).json({
        status:false,
        data: 'Email is required',
    });
  }

  if(!user.password) {
    return res.status(200).json({
        status:false,
        data: 'Password is required',
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
        return res.status(200).json({
            status:false,
            data: 'Credentials Invalid',
        });
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({  status:true ,data: {user: user.toAuthJSON() }});
    }
      return res.status(200).json({
          status:false,
          data: 'Credentials Invalid',
      });
    return status(400).info;
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.status(200).json({
            status:false,
            data: 'Please Login',
        });
      }
    return res.status(200).json({
        status:true,
        data: { user: user.toAuthJSON() }
    });
      // return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;