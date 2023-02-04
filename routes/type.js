const express = require("express");
const router = express.Router();
const db = require("../Modules/db_connect");
const upload = require("../Modules/upload-img");

router.get("/:shop_sid", async (req, res) => {
  const data = {
    types: {},
    products: {},
  };
  const { shop_sid } = req.params;

  const type_sql =
    "SELECT * FROM products_types WHERE shop_sid=? ORDER BY products_types.type_order";
  const [type_rows] = await db.query(type_sql, [shop_sid]);

  const product_sql = "SELECT * FROM `products` WHERE shop_sid=?";
  const [product_rows] = await db.query(product_sql, [shop_sid]);

  data.types = type_rows;
  data.products = product_rows;

  res.json(data);
});
// 快速填入
router.post("/demo-data", upload.none(), async (req, res) => {
  const data = [
    { sid: 1001, name: "嚼對推薦專區", shop_sid: 41, type_order: 2 },
    { sid: 1002, name: "牧場鮮奶茶", shop_sid: 41, type_order: 3 },
    { sid: 1003, name: "台灣鮮豆奶", shop_sid: 41, type_order: 4 },
    { sid: 1004, name: "綠光牧場鮮奶", shop_sid: 41, type_order: 5 },
  ];
  for (let i = 0; i < data.length; i++) {
    const { sid, name, shop_sid, type_order } = data[i];
    const sql =
      "INSERT INTO `products_types`(`sid`, `name`, `shop_sid`, `type_order`) VALUES (?,?,?,?)";
    const result = await db.query(sql, [sid, name, shop_sid, type_order]);
  }

  res.send("OK");
});

// 儲存新增類別的API，sid是type_sid
router.post("/:shop_sid", upload.none(), async (req, res) => {
  const { shop_sid } = req.params;
  const { type_name } = req.body;
  // console.log(req.body);

  const output = {
    success: false,
    error: "資料新增失敗",
  };

  try {
    // 找到目前最高的type_order是多少，並+1
    const order_sql =
      "SELECT type_order FROM `products_types` WHERE shop_sid=? ORDER BY type_order DESC LIMIT 1";
    const [[order_rows]] = await db.query(order_sql, [shop_sid]);
    console.log(order_rows);
    const order = order_rows ? Number(order_rows.type_order) : 1;

    // 計算目前order排到第幾個
    // const sql_order =
    //   "SELECT COUNT(1) as num FROM `products_types` WHERE shop_sid=?";
    // const [[{ num }]] = await db.query(sql_order, [shop_sid]);
    // const order = Number(num + 1);

    const sql =
      "INSERT INTO `products_types`( `name`, `shop_sid`, `type_order`) VALUES (?,?,?)";
    const result = await db.query(sql, [type_name, shop_sid, order]);

    if (result[0].affectedRows) {
      output.success = true;
      output.error = "";
    }
  } catch (e) {
    output.error = e;
  }
  console.log(output);
  res.json(output);
});

router.put("/order", upload.none(), async (req, res) => {
  console.log(req.body);
  const sql = "UPDATE `products_types` SET `type_order`=? WHERE sid=?";
  for (let i = 0; i < req.body.length; i++) {
    const [result1] = await db.query(sql, [i + 1, req.body[i].sid]);
  }
  console.log(123);

  res.send("ok");
});

// 更新的儲存按鈕按下:
router.put("/:sid", upload.none(), async (req, res) => {
  const output = {
    success: false,
    error: "資料新增失敗",
  };

  const { sid } = req.params;
  const { type_name } = req.body;
  const sql = "UPDATE `products_types` SET `name`=? WHERE sid=?";
  try {
    const result = await db.query(sql, [type_name, sid]);

    if (result[0].affectedRows) {
      output.success = true;
      output.error = "";
    }
  } catch (e) {
    output.error = e;
  }
  res.json(output);
});

// 刪除快速填入的類別
router.delete("/demo-data", upload.none(), async (req, res) => {
  for (let i = 1001; i <= 1004; i++) {
    const sql = "DELETE FROM `products_types` WHERE sid=?";
    const result = await db.query(sql, [i]);
  }
  res.send("OK");
});

router.delete("/:sid", async (req, res) => {
  const { sid } = req.params;
  const sql = "DELETE FROM `products_types` WHERE sid=?";
  const result = await db.query(sql, [sid]);
  res.json(result);
});

module.exports = router;
