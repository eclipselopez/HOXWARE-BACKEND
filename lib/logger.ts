import pino from 'pino'
import config from 'config'

const streams = [
    { stream: process.stdout },
    // { stream: pino.destination(`./logs/${config.get('api.identifier')}-${Date.now()}.log`)}
]

const options = (config.has('logger.options')) ? Object.assign({}, config.get('logger.options')) : {};
let logger = pino(options, pino.multistream(streams))

export default logger;