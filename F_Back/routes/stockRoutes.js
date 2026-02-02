import express from "express";
import Product from "../models/productModel.js";

const router = express.Router();

// @desc    Get stock report
// @route   GET /api/stock
// @access  DEV (no auth)
router.get("/", async (req, res) => {
  const products = await Product.find({})
    .select("name countInStock price category brand");

  res.json(products);
});

export default router;
