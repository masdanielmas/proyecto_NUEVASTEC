require('dotenv').config();

module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/platzi_clone'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_key_123',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    server: {
        port: process.env.PORT || 3000
    }
};