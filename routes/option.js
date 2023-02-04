const express = require("express");
const router = express.Router();
const db = require("../Modules/db_connect");
const upload = require("../Modules/upload-img");

router.get("/:shop_sid", async (req, res) => {
  const data = {
    options_types: {},
    options: {},
  };
  const { shop_sid } = req.params;
  const option_type_sql = "SELECT * FROM `options_types` WHERE `shop_sid`=?";
  const [option_type_rows] = await db.query(option_type_sql, [shop_sid]);

  const option_sql =
    "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid WHERE ot.shop_sid=?";
  const [option_rows] = await db.query(option_sql, [shop_sid]);

  data.options_types = option_type_rows;
  data.options = option_rows;

  res.json(data);
});
// 快速填入
router.post("/demo-data", upload.none(), async (req, res) => {
  // 填入option_type
  ot_data = [
    {
      sid: 1001,
      name: "加料選擇",
      shop_sid: 41,
      max: 2,
      min: 0,
      options_type_order: 1,
    },
    {
      sid: 1002,
      name: "尺寸選擇【小杯】",
      shop_sid: 41,
      max: 1,
      min: 1,
      options_type_order: 2,
    },
    {
      sid: 1003,
      name: "甜度選擇",
      shop_sid: 41,
      max: 1,
      min: 1,
      options_type_order: 3,
    },
    {
      sid: 1004,
      name: "溫度選擇【冷飲】",
      shop_sid: 41,
      max: 1,
      min: 1,
      options_type_order: 4,
    },
    {
      sid: 1005,
      name: "溫度選擇【熱飲】",
      shop_sid: 41,
      max: 1,
      min: 1,
      options_type_order: 5,
    },
    {
      sid: 1006,
      name: "超值加購",
      shop_sid: 41,
      max: 1,
      min: 0,
      options_type_order: 6,
    },
  ];
  for (let i = 0; i < ot_data.length; i++) {
    const { sid, name, shop_sid, max, min, options_type_order } = ot_data[i];
    const ot_sql =
      "INSERT INTO `options_types`(`sid`, `name`, `shop_sid`, `max`, `min`, `options_type_order`) VALUES (?,?,?,?,?,?)";
    const ot_result = await db.query(ot_sql, [
      sid,
      name,
      shop_sid,
      max,
      min,
      options_type_order,
    ]);
  }
  // 填入opt
  opt_data = [
    {
      sid: 1001,
      name: "加珍珠",
      price: 5,
      options_type_sid: 1001,
      option_order: 1,
    },
    {
      sid: 1002,
      name: "加椰果",
      price: 5,
      options_type_sid: 1001,
      option_order: 2,
    },
    {
      sid: 1003,
      name: "加粉條",
      price: 5,
      options_type_sid: 1001,
      option_order: 3,
    },
    {
      sid: 1004,
      name: "加蒟蒻",
      price: 10,
      options_type_sid: 1001,
      option_order: 4,
    },
    {
      sid: 1005,
      name: "加布丁",
      price: 10,
      options_type_sid: 1001,
      option_order: 5,
    },
    // 尺寸
    { sid: 1006, name: "S", price: 0, options_type_sid: 1002, option_order: 1 },
    {
      sid: 1007,
      name: "M",
      price: 20,
      options_type_sid: 1002,
      option_order: 2,
    },
    // 甜度
    {
      sid: 1008,
      name: "無糖",
      price: 0,
      options_type_sid: 1003,
      option_order: 1,
    },
    {
      sid: 1009,
      name: "微糖",
      price: 0,
      options_type_sid: 1003,
      option_order: 2,
    },
    {
      sid: 1010,
      name: "半糖",
      price: 0,
      options_type_sid: 1003,
      option_order: 3,
    },
    {
      sid: 1011,
      name: "少糖",
      price: 0,
      options_type_sid: 1003,
      option_order: 4,
    },
    {
      sid: 1012,
      name: "正常糖",
      price: 0,
      options_type_sid: 1003,
      option_order: 5,
    },
    // 冷飲
    {
      sid: 1013,
      name: "正常冰",
      price: 0,
      options_type_sid: 1004,
      option_order: 1,
    },
    {
      sid: 1014,
      name: "少冰",
      price: 0,
      options_type_sid: 1004,
      option_order: 2,
    },
    {
      sid: 1015,
      name: "微冰",
      price: 0,
      options_type_sid: 1004,
      option_order: 3,
    },
    {
      sid: 1016,
      name: "去冰",
      price: 0,
      options_type_sid: 1004,
      option_order: 4,
    },
    {
      sid: 1017,
      name: "常溫",
      price: 0,
      options_type_sid: 1004,
      option_order: 5,
    },
    {
      sid: 1018,
      name: "溫",
      price: 0,
      options_type_sid: 1004,
      option_order: 6,
    },
    {
      sid: 1019,
      name: "熱",
      price: 0,
      options_type_sid: 1004,
      option_order: 7,
    },
    // 熱飲
    {
      sid: 1020,
      name: "常溫",
      price: 0,
      options_type_sid: 1005,
      option_order: 1,
    },
    {
      sid: 1021,
      name: "溫",
      price: 0,
      options_type_sid: 1005,
      option_order: 2,
    },
    {
      sid: 1022,
      name: "熱",
      price: 0,
      options_type_sid: 1005,
      option_order: 3,
    },
    // 超值加購
    {
      sid: 1023,
      name: "綠茶【小】",
      price: 20,
      options_type_sid: 1006,
      option_order: 1,
    },
    {
      sid: 1024,
      name: "紅茶【小】",
      price: 25,
      options_type_sid: 1006,
      option_order: 2,
    },
    {
      sid: 1025,
      name: "清茶【小】",
      price: 25,
      options_type_sid: 1006,
      option_order: 3,
    },
    {
      sid: 1026,
      name: "烏龍茶【小】",
      price: 30,
      options_type_sid: 1006,
      option_order: 4,
    },
    
  ];
  for (let i = 0; i < opt_data.length; i++) {
    const { sid, name, price, options_type_sid, option_order } = opt_data[i];
    const opt_sql =
      "INSERT INTO `options`(`sid`, `name`, `price`, `options_type_sid`, `option_order`) VALUES (?,?,?,?,?)";
    const opt_result = await db.query(opt_sql, [
      sid,
      name,
      price,
      options_type_sid,
      option_order,
    ]);
  }
  // 建立ot_opt關係
  otpr_data = [
    // 20001商品
    { sid: 2001, product_sid: 20001, options_type_sid: 1002 },
    { sid: 2002, product_sid: 20001, options_type_sid: 1003 },
    { sid: 2003, product_sid: 20001, options_type_sid: 1004 },
    { sid: 2004, product_sid: 20001, options_type_sid: 1006 },
    // 20002商品
    { sid: 2005, product_sid: 20002, options_type_sid: 1002 },
    { sid: 2006, product_sid: 20002, options_type_sid: 1003 },
    { sid: 2007, product_sid: 20002, options_type_sid: 1004 },
    { sid: 2008, product_sid: 20002, options_type_sid: 1001 },
    // 20003商品
    { sid: 2009, product_sid: 20003, options_type_sid: 1002 },
    { sid: 2010, product_sid: 20003, options_type_sid: 1003 },
    { sid: 2011, product_sid: 20003, options_type_sid: 1004 },
    { sid: 2012, product_sid: 20003, options_type_sid: 1006 },
    // 20004商品
    { sid: 2013, product_sid: 20004, options_type_sid: 1002 },
    { sid: 2014, product_sid: 20004, options_type_sid: 1003 },
    { sid: 2015, product_sid: 20004, options_type_sid: 1004 },
    { sid: 2016, product_sid: 20004, options_type_sid: 1001 },
  ];
  for (let i = 0; i < otpr_data.length; i++) {
    const { sid, product_sid, options_type_sid } = otpr_data[i];
    const otpr_sql =
      "INSERT INTO `options_types_products_relation`(`sid`, `product_sid`, `options_type_sid`) VALUES (?,?,?)";
    const otpr_result = await db.query(otpr_sql, [
      sid,
      product_sid,
      options_type_sid,
    ]);
  }

  res.send("OK");
});

router.post("/:shop_sid", upload.none(), async (req, res) => {
  const { shop_sid } = req.params;
  const { sid, name, min, max, optionData } = req.body;
  const output = {
    success: false,
    error: "",
    postData: req.body,
  };

  const option_type_sql =
    "INSERT INTO `options_types`(`name`, `shop_sid`, `min`, `max`) VALUES (?,?,?,?)";
  const [option_type_result] = await db.query(option_type_sql, [
    name,
    shop_sid,
    min,
    max,
  ]);
  console.log(option_type_result);
  const option_sql =
    "INSERT INTO `options`(`name`, `price`, `options_type_sid`) VALUES (?,?,?)";
  for (let i = 0; i < optionData.length; i++) {
    const [option_result] = await db.query(option_sql, [
      optionData[i].name,
      optionData[i].price ? optionData[i].price : 0,
      option_type_result.insertId,
    ]);
    console.log(option_result);
  }
  res.send("OK");
});

router.put("/:shop_sid", async (req, res) => {
  const { shop_sid } = req.params;
  const { sid, name, min, max, optionData } = req.body;
  const output = {
    success: false,
    error: "",
    postData: req.body,
  };

  const option_type_sql =
    "UPDATE `options_types` SET `name`=?,`shop_sid`=?,`max`=?,`min`=? WHERE sid=?";
  const [option_type_result] = await db.query(option_type_sql, [
    name,
    shop_sid,
    max,
    min,
    sid,
  ]);
  console.log(option_type_result);

  // 處理選項時，先刪除目前這個選項類別下所有的選項
  const delete_option_sql = "DELETE FROM `options` WHERE options_type_sid=?";
  const [delete_option_result] = await db.query(delete_option_sql, [sid]);
  console.log(delete_option_result);
  // 接下來再insert所有的選項
  const insert_option_sql =
    "INSERT INTO `options`(`name`, `price`, `options_type_sid`) VALUES (?,?,?)";
  for (let i = 0; i < optionData.length; i++) {
    const [insert_option_result] = await db.query(insert_option_sql, [
      optionData[i].name,
      optionData[i].price ? optionData[i].price : 0,
      sid,
    ]);
    console.log(insert_option_result);
  }
  res.send("OK");
});

router.delete("/demo-data", upload.none(), async (req, res) => {
  for (let i = 1001; i <= 1006; i++) {
    const delete_option_type_sql = "DELETE FROM `options_types` WHERE sid=?";
    const [option_type_result] = await db.query(delete_option_type_sql, [i]);
  }

  for (let i = 1001; i <= 1026; i++) {
    const delete_option_sql = "DELETE FROM `options` WHERE sid=?";
    const [delete_option_result] = await db.query(delete_option_sql, [i]);
  }

  for (let i = 2001; i <= 2016; i++) {
    const delete_otpr_sql =
      "DELETE FROM `options_types_products_relation` WHERE sid=?";
    const [delete_otpr_result] = await db.query(delete_otpr_sql, [i]);
  }

  res.send("ok");
});

router.delete("/:sid", upload.none(), async (req, res) => {
  const { sid } = req.params;

  // 刪掉所選的option_type
  const delete_option_type_sql = "DELETE FROM `options_types` WHERE sid=?";
  const [option_type_result] = await db.query(delete_option_type_sql, [sid]);
  console.log(option_type_result);

  // 刪掉所刪option_type下面的option
  const delete_option_sql = "DELETE FROM `options` WHERE options_type_sid=?";
  const [delete_option_result] = await db.query(delete_option_sql, [sid]);
  console.log(delete_option_result);

  const delete_otpr_sql =
    "DELETE FROM `options_types_products_relation` WHERE options_type_sid=?";
  const [delete_otpr_result] = await db.query(delete_otpr_sql, [sid]);

  res.send("OK");
});

module.exports = router;
