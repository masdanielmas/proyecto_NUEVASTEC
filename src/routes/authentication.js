const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require("../models/user");
const auth = require('../middleware/auth');

module.exports = router;
