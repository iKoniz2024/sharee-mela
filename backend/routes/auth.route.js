const express = require("express");

const {
    login,
    logout,
    refreshToken
} = require("../controllers/auth.controller");

const validate = require("../middlewares/validate");

const {
    loginSchema
} = require("../validations/auth.validation");

const router = express.Router();

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.post(
    "/logout",
    logout
);

router.post("/refresh-token", refreshToken);

module.exports = router;
