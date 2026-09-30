const jwt = require("jsonwebtoken");

const getToken = (req) => {
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7).trim();
    }
    return null;
};

const verifyToken = (req, res, next) => {
    try {
        const token = getToken(req);

        if (!token) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).send({
            message: "Invalid or expired token"
        });
    }
};

const verifyOptionalToken = (req, res, next) => {
    try {
        const token = getToken(req);

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        next();

    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = verifyToken;
module.exports.verifyOptionalToken = verifyOptionalToken;