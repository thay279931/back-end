const express = require("express");
const router = express.Router();
const db = require("../Modules/db_connect");

router.get("/", async (req, res) => {
  console.log(123);
  const { sid } = req.query;

  const data = {
    shop: {},
    product: {},
    options_types: {},
    options: {},
  };

  const shop_sql =
    "SELECT s.* FROM `shop` s LEFT JOIN `products` p ON p.shop_sid=s.sid WHERE p.sid=?";
  const [[shop_rows]] = await db.query(shop_sql, [sid]);

  const product_sql = "SELECT * FROM `products` WHERE sid=?";
  const [[product_rows]] = await db.query(product_sql, [sid]);

  const option_type_sql =
    "SELECT ot.*, otpr.product_sid FROM `options_types` ot LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
  const [option_type_rows] = await db.query(option_type_sql, [sid]);

  const option_sql =
    "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
  const [option_rows] = await db.query(option_sql, [sid]);

  data.shop = shop_rows;
  data.product = product_rows;
  data.options_types = option_type_rows;
  data.options = option_rows;

  console.log(data);
  res.json(data);
});

module.exports = router;
