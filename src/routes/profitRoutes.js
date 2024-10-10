const express = require("express");
const router = express.Router();
const { getProfit } = require("../controllers/profitController");

// Profit calculation route
router.get("/", getProfit);

module.exports = router;
