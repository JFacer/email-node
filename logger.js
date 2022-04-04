const { format } = require("express/lib/response");
const winston = require("winston");
const { File, Console } = require("winston/lib/winston/transports");

class Logger {

    constructor(name, options) {
        this.logger = winston.createLogger({
            level: options.logLevel,
            defaultMeta: { service: name },
            transports: [
                new File({ 
                    filename: './logs/' + name + '.log',
                    timestamp: true,
                    colorize: false,
                    format: winston.format.combine(
                        winston.format.timestamp({
                            format: 'YYYY.MM.DD HH:mm:ss.SSS'
                        }),
                        winston.format.errors({ stack: true }),
                        winston.format.printf(info => `${[info.timestamp]} ${info.service} [${info.level.toUpperCase()}] > ${info.message}`),
                    )
                })
            ]
        });

        //
        // If we're not in production then log to the `console` with the format:
        // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        //
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new Console({
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: 'DD.MM.YY HH:mm:ss.SSS'
                    }),
                    winston.format.metadata({ fillExcept: ['timestamp', 'service', 'level', 'message'] }),
                    winston.format.colorize(),
                    this.winstonConsoleFormat()
                )
            }));
        }
    }

    winstonConsoleFormat() {
        return winston.format.printf(({ timestamp, service, level, message, metadata }) => {
            const metadataString = metadata != null ? JSON.stringify(metadata) : '';
            if (process.env._) {
                return `[${service}] [${level}] ${message} -> ${'metadata: ' + metadataString}`;
            } else {
                //console.log (`[${level}]  ${message}.  ${'-->  ' + metadataString}`);
                return `${timestamp} [${service}] [${level}] ${message}`;
            }

        })
    }

    // Expose different log levels
    debug(log, metadata) {
        this.logger.debug(log, metadata);
    }

    info(log, metadata) {
        this.logger.info(log, metadata);
    }

    warn(log, metadata) {
        this.logger.warn(log, metadata);
    }

    error(log, metadata) {
        this.logger.error(log, metadata);
    }

    log(level, log, metadata) {
        const metadataObject = {};
        if (metadata) metadataObject.metadata = metadata

        this.logger[level](log, metadataObject)
    }

}
 
// Exporting Logger with a name
module.exports = new Logger(process.env.APP_NAME, {
    logLevel: process.env.LOG_LEVEL
});
//module.exports = new Logger("WLogger")

// Expose a function to use logger with custom parameter
module.getLogger = (name) => {
    return new Logger(name);
}
