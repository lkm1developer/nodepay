const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const PlatformsSchema = new Schema({
    email: String,
    apiKey:String,
    apiSecret:String,
    type:String,
    hash: String,
    salt: String,
    userId:String,
});

PlatformsSchema.methods.setPassword = function(apiSecret) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(apiSecret, this.salt, 10000, 512, 'sha512').toString('hex');
};

PlatformsSchema.methods.validatePassword = function(apiSecret) {
    const hash = crypto.pbkdf2Sync(apiSecret, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

PlatformsSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        email: this.email,
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}

PlatformsSchema.methods.toAuthJSON = function() {
    return {
        token: this.generateJWT(),
    };
};

mongoose.model('Platforms', PlatformsSchema);