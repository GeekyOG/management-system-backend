const express = require("express");
const router = express.Router();
const { getProfit } = require("../controllers/profitController");

router.use(enforceMultiTenancy);
// Profit calculation route
router.get("/", getProfit);

module.exports = router;
