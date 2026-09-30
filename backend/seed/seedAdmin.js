require("dotenv").config();

const bcrypt = require("bcrypt");
const { connectDB, getDB } = require("../config/db");

const seedAdmin = async () => {
    try {
        await connectDB();

        const db = getDB();
        const usersCollection = db.collection("users");

        const existingAdmin = await usersCollection.findOne({
            email: process.env.ADMIN_EMAIL
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            10
        );

        await usersCollection.insertOne({
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            profilePhoto: "",
            phone: "",
            address: "",
            role: "admin",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log("Admin created successfully.");

        process.exit();

    } catch (error) {

        console.log(error);

        process.exit(1);

    }
};

seedAdmin();