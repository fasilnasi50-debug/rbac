const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Access denied, token is required'
        });
    }

    const match = authHeader.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }

    try {
        req.user = jwt.verify(match[1], process.env.JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = verifyToken;