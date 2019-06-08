/**
 * Configurations of logger.
 */
const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');

// const consoleConfig = [
//     new winston.transports.Console({
//         'colorize': true
//     })
// ];
//
// let createLogger =  winston.createLogger({
//     'transports': consoleConfig
// });
//  createLogger = winston.createLogger({
//     transports: [
//         new (winston.transports.Console)(options.console),
//         new (winston.transports.File)(options.errorFile),
//         new (winston.transports.File)(options.file)
//     ],
//     // transports: [
//     //     new (winston.transports.Console)({ level: 'error' }),
//     //     new (winston.transports.File)({ filename: 'somefile.log' })
//     // ],
//     // exitOnError: false, // do not exit on handled exceptions
// });
// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.json(),
//     transports: [
//         //
//         // - Write to all logs with level `info` and below to `combined.log`
//         // - Write all logs error (and below) to `error.log`.
//         //
//         new winston.transports.File({ filename: 'error.log', level: 'error' }),
//         new winston.transports.File({ filename: 'combined.log' })
//     ]
// });
// const successLogger = logger;
// successLogger.add(winstonRotator, {
//     'name': 'access-file',
//     'level': 'info',
//     'filename': './logs/access.log',
//     'json': false,
//     'datePattern': 'yyyy-MM-dd-',
//     'prepend': true
// });
//
// const errorLogger = logger;
// errorLogger.add(winstonRotator, {
//     'name': 'error-file',
//     'level': 'error',
//     'filename': './logs/error.log',
//     'json': false,
//     'datePattern': 'yyyy-MM-dd-',
//     'prepend': true
// });
//
// module.exports = {
//     'successlog': successLogger,
//     'errorlog': errorLogger
// };
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
module.exports = logger;
//logger.info('Hello again distributed logs');