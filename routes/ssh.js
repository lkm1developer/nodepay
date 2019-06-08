
var crypto = require('crypto');
var SSH = require('simple-ssh');

module.exports = async function(cmd) {
    console.log('executing ',cmd);
    var ssh = new SSH({
        host: '45.76.57.10',
        user: 'root',
        pass: '=4vRewuf9PvhY_nK'
    });
    return new Promise((resolve, reject) => {
        ssh.exec(cmd, {
        out: function (stdout) {
            console.log(stdout);
            resolve(stdout)
        },

        err: function (stderr) {
            console.log('err', stderr);
            return reject(stderr)
        }
    }).start();
    });
    console.log('outputoutput',output)
    // return output;
//     return new Promise((resolve, reject) => {
//         ssh.exec(cmd)
//             host: host,
//     }, (err, stdout) => {
//         if (err) {
//             return reject(err)
//         }
//
//         result = stdout.split('\n');
//         resolve(result)
//     })
// })
};
