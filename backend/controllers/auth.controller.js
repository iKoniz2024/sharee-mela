const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getDB } = require("../config/db");
const { buildIdQuery } = require("../utils/buildIdQuery");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const db = getDB();

        const usersCollection = db.collection("users");

        const normalizedEmail = email.trim().toLowerCase();

        const user = await usersCollection.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Validation failed",
                errors: [
                    {
                        field: "email",
                        message: "Invalid email or password"
                    },
                    {
                        field: "password",
                        message: "Invalid email or password"
                    }
                ]
            });
        }

        const isPasswordMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: "Validation failed",
                errors: [
                    {
                        field: "email",
                        message: "Invalid email or password"
                    },
                    {
                        field: "password",
                        message: "Invalid email or password"
                    }
                ]
            });
        }

        const accessToken = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        const refreshToken = jwt.sign(
            {
                id: user._id.toString()
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).send({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken
        });
    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax"
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax"
        });

        res.status(200).send({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = (req.cookies && req.cookies.refreshToken) || (req.body && req.body.refreshToken);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

        const db = getDB();

        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne(buildIdQuery(decoded.id));

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const accessToken = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        const newRefreshToken = jwt.sign(
            {
                id: user._id.toString()
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.send({
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        });

    }
};

module.exports = {
    login,
    logout,
    refreshToken
};