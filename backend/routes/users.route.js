const express = require("express");

const {
    getAllUsers,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/users.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const { verifyOptionalToken } = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const {
    updateProfileSchema,
    changePasswordSchema
} = require("../validations/user.validation");

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getAllUsers);

router.get("/profile", verifyOptionalToken, getProfile);

router.patch(
    "/profile",
    verifyToken,
    validate(updateProfileSchema),
    updateProfile
);

router.patch(
    "/change-password",
    verifyToken,
    validate(changePasswordSchema),
    changePassword
);

module.exports = router;