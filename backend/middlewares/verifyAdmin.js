const { getDB } = require("../config/db");
const { buildIdQuery } = require("../utils/buildIdQuery");

const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const db = getDB();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne(buildIdQuery(req.user.id));

        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).send({
                message: "Access denied. Admin only."
            });
        }

        next();

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

module.exports = verifyAdmin;