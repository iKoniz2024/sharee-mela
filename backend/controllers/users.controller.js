const { getDB } = require("../config/db");
const { buildIdQuery } = require("../utils/buildIdQuery");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
    try {
        const db = getDB();
        const usersCollection = db.collection("users");

        const users = await usersCollection.find(
            {},
            { projection: { password: 0 } }
        ).sort({ createdAt: -1 }).toArray();

        res.status(200).send({
            totalUsers: users.length,
            users
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(200).send({ user: null });
        }

        const db = getDB();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne(
            buildIdQuery(req.user.id),
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(200).send({ user: null });
        }

        res.send(user);

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const db = getDB();
        const usersCollection = db.collection("users");

        const { name, phone, address, profilePhoto } = req.body || {};

        const updateData = {
            updatedAt: new Date()
        };

        if (name !== undefined) updateData.name = String(name).trim();
        if (phone !== undefined) updateData.phone = String(phone).trim();
        if (address !== undefined) updateData.address = String(address).trim();
        if (profilePhoto !== undefined) updateData.profilePhoto = String(profilePhoto).trim();

        const result = await usersCollection.updateOne(
            buildIdQuery(req.user.id),
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({
                message: "User not found"
            });
        }

        res.send({
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};


const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).send({
                message: "Old password and new password are required"
            });
        }

        const db = getDB();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne(buildIdQuery(req.user.id));

        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }

        const isPasswordMatched = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isPasswordMatched) {
            return res.status(401).send({
                message: "Old password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await usersCollection.updateOne(
            buildIdQuery(req.user.id),
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );

        res.send({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getAllUsers,
    getProfile,
    updateProfile,
    changePassword
};