const express = require("express");
const router = express.Router();
const { getProfit, getAllPending } = require("../controllers/profitController");

// Profit calculation route
router.get("/", getProfit);

router.get("/pending", getAllPending);

module.exports = router;
