
var crypto = require('crypto');
var SSH = require('simple-ssh');
var SSH2Promise = require('ssh2-promise');
const log = require('./logger');
module.exports = async function(cmd) {

    var sshconfig = {
        host: '45.76.57.10',
        username: 'root',
        password: '=4vRewuf9PvhY_nK'
    }
    var ssh = new SSH2Promise(sshconfig);
    
    log.info(`ssh2-promise  ${cmd}`);
       return await ssh.exec(cmd)
        .then((data) => {
        log.info(`ssh2-promise suc  ${data}`);
            return {
                status: true,
                data: data
            }
        })
        .catch((err) => {
        log.error(`ssh2-promise err  ${err}`);
            return {
                status: false,
                data: err.toString()
            }
        });
}
