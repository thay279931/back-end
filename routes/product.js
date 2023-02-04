const express = require("express");
const router = express.Router();
const db = require("../Modules/db_connect");
const upload = require("../Modules/upload-img");

// 如果傳進來的sid不為零，找到該商品資料並且回傳
router.get("/edit-form", upload.single(), async (req, res) => {
  const { sid } = req.query;

  const data = {
    shop: {},
    types: {},
    product: {},
    options_types: {},
    options: {},
    only_options_types: {},
  };
  const shop_sql =
    "SELECT s.* FROM `shop` s LEFT JOIN `products` p ON p.shop_sid=s.sid WHERE p.sid=?";
  const [[shop_rows]] = await db.query(shop_sql, [sid]);

  const type_sql = "SELECT * FROM products_types WHERE shop_sid=?";
  const [type_rows] = await db.query(type_sql, [shop_rows.sid]);

  const product_sql = "SELECT * FROM `products` WHERE sid=?";
  const [[product_rows]] = await db.query(product_sql, [sid]);

  const option_type_sql =
    "SELECT ot.*, otpr.product_sid FROM `options_types` ot LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
  const [option_type_rows] = await db.query(option_type_sql, [sid]);

  // const option_sql =
  //   "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
  // const [option_rows] = await db.query(option_sql, [sid]);
  const option_sql =
    "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid WHERE ot.shop_sid=?";
  const [option_rows] = await db.query(option_sql, [shop_rows.sid]);

  const only_option_type_sql =
    "SELECT * FROM `options_types` WHERE `shop_sid`=?";
  const [only_option_type_rows] = await db.query(only_option_type_sql, [
    shop_rows.sid,
  ]);

  data.shop = shop_rows;
  data.types = type_rows;
  data.product = product_rows;
  data.options_types = option_type_rows;
  data.options = option_rows;
  data.only_options_types = only_option_type_rows;

  console.log(data);
  res.json(data);
});

// 如果回傳為零，代表要新增資料，只需要回傳這個餐廳的選項類別和選項回去
router.get("/add-form", upload.single(), async (req, res) => {
  const { shop_sid } = req.query;

  const data = {
    shop: {},
    types: {},
    product: {},
    options_types: {},
    options: {},
    only_options_types: {},
  };
  const shop_sql = "SELECT s.* FROM `shop` s WHERE s.sid=?";
  const [[shop_rows]] = await db.query(shop_sql, [shop_sid]);

  const type_sql = "SELECT * FROM products_types WHERE shop_sid=?";
  const [type_rows] = await db.query(type_sql, [shop_sid]);

  // const product_sql = "SELECT * FROM `products` WHERE sid=?";
  // const [[product_rows]] = await db.query(product_sql, [sid]);

  // const option_type_sql =
  //   "SELECT ot.*, otpr.product_sid FROM `options_types` ot LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
  // const [option_type_rows] = await db.query(option_type_sql, [sid]);

  // const option_sql =
  //   "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
  // const [option_rows] = await db.query(option_sql, [sid]);
  const option_sql =
    "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid WHERE ot.shop_sid=?";
  const [option_rows] = await db.query(option_sql, [shop_sid]);

  const only_option_type_sql =
    "SELECT * FROM `options_types` WHERE `shop_sid`=?";
  const [only_option_type_rows] = await db.query(only_option_type_sql, [
    shop_sid,
  ]);

  data.shop = shop_rows;
  data.types = type_rows;
  // data.product = product_rows;
  // data.options_types = option_type_rows;
  data.options = option_rows;
  data.only_options_types = only_option_type_rows;

  console.log(data);
  res.json(data);
});

router.get("/:shop_sid", async (req, res) => {
  const data = {
    types: {},
    products: {},
    options_types: {},
    only_options_types: {},
  };
  const { shop_sid } = req.params;

  const type_sql =
    "SELECT * FROM products_types WHERE shop_sid=? ORDER BY products_types.type_order";
  const [type_rows] = await db.query(type_sql, [shop_sid]);
  console.log(shop_sid);
  // 從資料庫取得商品資料與其類別名稱
  const product_sql =
    "SELECT p.*,pt.name type_name FROM `products` p LEFT JOIN `products_types` pt ON p.`products_type_sid`=pt.`sid` WHERE p.shop_sid=?";
  const [product_rows] = await db.query(product_sql, [shop_sid]);
  // const [product_rows] = await db.query(product_sql, [89]);
  console.log(product_rows);

  // 從資料庫取得選項類別的資料，帶有product_sid
  const option_type_sql =
    "SELECT ot.*, otpr.product_sid FROM `options_types` ot LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid JOIN `products` p ON otpr.product_sid=p.sid WHERE p.shop_sid=?";
  const [option_type_rows] = await db.query(option_type_sql, [shop_sid]);

  const only_option_type_sql =
    "SELECT * FROM `options_types` WHERE `shop_sid`=?";
  const [only_option_type_rows] = await db.query(only_option_type_sql, [
    shop_sid,
  ]);

  const option_sql =
    "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid WHERE ot.shop_sid=?";
  const [option_rows] = await db.query(option_sql, [shop_sid]);

  data.types = type_rows;
  data.options = option_rows;
  data.products = product_rows;
  data.options_types = option_type_rows;
  data.only_options_types = only_option_type_rows;

  res.json(data);
});

// 快速填入
router.post("/demo-data", upload.none(), async (req, res) => {
  // 資料sid從1201開始
  const product_data = [
    {
      sid: 20001,
      name: "檸檬蜜Q晶凍",
      shop_sid: 41,
      price: 65,
      products_type_sid: 1001,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 65,
      note: "聯名【蜜蜂工坊】百花純蜜，酸甜清爽的蜂蜜檸檬，咕溜清爽綠茶凍，以及超Ｑ彈黃金Q角，口感一次大滿足！(總熱量(最高)443 Kcal 總糖量(最高)88g)【Ｌ】※蜂蜜甜度固定調整蔗糖、微/去冰限定",
      src: "product101.jpg",
    },
    {
      sid: 20002,
      name: "蜜Q大麥拿鐵",
      shop_sid: 41,
      price: 75,
      products_type_sid: 1001,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 75,
      note: "聯名【蜜蜂工坊】百花純蜜，濃郁炒焙大麥拿鐵融合醇香蜂蜜，搭配Ｑ彈黃金糖口味粉角！｜【L杯】總熱量(最高)458 Kcal·總糖量(最高)64g｜※無咖啡因 ※甜度固定僅添加蜂蜜",
      src: "product102.jpg",
    },
    {
      sid: 20003,
      name: "蜜Q茉香拿鐵Honey Green Tea Latte with Golden Cube Jelly",
      shop_sid: 41,
      price: 75,
      products_type_sid: 1001,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 75,
      note: "聯名【蜜蜂工坊】百花純蜜，搭配經典茉香綠茶拿鐵，還有Ｑ彈黃金糖口味粉角！｜總熱量(最高)447 Kcal·總糖量(最高)64g｜※甜度固定僅添加蜂蜜",
      src: "product103.jpg",
    },
    {
      sid: 20004,
      name: "珍珠伯爵紅茶拿鐵 Black Tea Latte with bubble",
      shop_sid: 41,
      price: 60,
      products_type_sid: 1001,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 60,
      note: "招牌飲品No.1！自家牧場鮮奶調配而成的鮮奶茶，搭配手工熬煮珍珠，軟Q彈牙｜總熱量(最高)426 Kcal、總糖量(最高)35g",
      src: "product104.jpg",
    },
    {
      sid: 20005,
      name: "珍珠手炒黑糖鮮奶 Brown Sugar Fresh Milk with Bubble",
      shop_sid: 41,
      price: 90,
      products_type_sid: 1001,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 90,
      note: "招牌飲品TOP 3！門市手工熬煮黑糖，清甜焦香不膩口，搭配手工熬煮珍珠，軟Q彈牙。｜※無咖啡因｜總熱量(最高)452 Kcal·總糖量(最高)40g",
      src: "product105.jpg",
    },
    {
      sid: 20006,
      name: "仙草凍冬瓜茶 White Gourd Tea with Grass Jelly",
      shop_sid: 41,
      price: 45,
      products_type_sid: 1001,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 45,
      note: "台灣古早味經典飲品搭配門市手工仙草凍，口感滑嫩 ｜※無咖啡因｜總熱量(最高)267 Kcal·總糖量(最高)63g",
      src: "product106.jpg",
    },
    {
      sid: 20007,
      name: "珍珠焙香決明大麥 Barley Tea with Bubble",
      shop_sid: 41,
      price: 45,
      products_type_sid: 1001,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 45,
      note: "搭配手工烹煮麥茶＋蜜漬香Ｑ珍珠｜※無咖啡因 ｜總熱量(最高)260 Kcal·總糖量(最高)29g",
      src: "product107.jpg",
    },
    {
      sid: 20008,
      name: "蜂蜜麥茶拿鐵Honey Barley Tea Latte",
      shop_sid: 41,
      price: 60,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 60,
      note: "聯名【蜜蜂工坊】百花純蜜，炒焙大麥拿鐵融合蜂蜜，香氣厚實入口滑順！｜總熱量(最高)204 Kcal·總糖量(最高)31g｜※無咖啡因 ※甜度固定僅添加蜂蜜",
      src: "product108.jpg",
    },
    {
      sid: 20009,
      name: "蜂蜜綠茶拿鐵Honey Green Tea Latte",
      shop_sid: 41,
      price: 60,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 60,
      note: "聯名【蜜蜂工坊】百花純蜜，搭配經典茉香綠茶拿鐵，清新甘醇彷彿置身百花森林！｜總熱量(最高)220 Kcal·總糖量(最高)31g)※甜度固定僅添加蜂蜜",
      src: "product109.jpg",
    },
    {
      sid: 20010,
      name: "伯爵可可拿鐵 Cocoa Earl Grey Black Tea Latte",
      shop_sid: 41,
      price: 55,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 55,
      note: "法國頂級法芙娜100%純可可與帶有佛手柑香氣的伯爵拿鐵融合※可可粉無加糖，建議最低甜度一分甜。｜總熱量(最高)327 Kcal·總糖量(最高)44g",
      src: "product110.jpg",
    },
    {
      sid: 20011,
      name: "布朗紅茶拿鐵 Brown Sugar Black Tea Latte",
      shop_sid: 41,
      price: 55,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 55,
      note: "門市手炒黑糖特殊濃郁焦香搭配經典大正紅茶及綠光鮮奶調製鮮奶茶｜總熱量(最高)312 Kcal·總糖量(最高)47g",
      src: "product111.jpg",
    },
    {
      sid: 20012,
      name: "伯爵紅茶拿鐵 Earl Grey Black Tea Latte",
      shop_sid: 41,
      price: 50,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 50,
      note: "柑橘果香(佛手柑)的伯爵紅茶，風味較大正紅茶拿鐵更濃郁、香醇｜總熱量(最高)236 Kcal·總糖量(最高)34g",
      src: "product112.jpg",
    },
    {
      sid: 20013,
      name: "大正紅茶拿鐵 Traditional Black Tea Latte",
      shop_sid: 41,
      price: 50,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 50,
      note: "自家牧場綠光鮮奶ｘ古早味大正紅茶，風味輕盈滑順｜總熱量(最高)211 Kcal·總糖量(最高)34g",
      src: "product113.jpg",
    },
    {
      sid: 20014,
      name: "茉香綠茶拿鐵 Green Tea Latte",
      shop_sid: 41,
      price: 45,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 45,
      note: "使用茉香綠茶ｘ自家牧場綠光鮮奶，清新茉莉花香，滋味清爽順口｜總熱量(最高)219 Kcal·總糖量(最高)33g",
      src: "product114.jpg",
    },
    {
      sid: 20015,
      name: "琥珀烏龍拿鐵 Oolong Tea Latte",
      shop_sid: 41,
      price: 45,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 45,
      note: "高峰烏龍茶(炭焙香)ｘ牧場綠光鮮奶，柔順、氣息層次豐富 ｜總熱量(最高)208 Kcal·總糖量(最高)31g",
      src: "product115.jpg",
    },
    {
      sid: 20016,
      name: "原片青茶拿鐵 Light Oolong Latte",
      shop_sid: 41,
      price: 45,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 45,
      note: "淡雅清香青茶ｘ牧場綠光鮮奶，甘甜醇滑｜總熱量(最高)228 Kcal·總糖量(最高)33g",
      src: "product116.jpg",
    },
    {
      sid: 20017,
      name: "焙香大麥拿鐵 Barley Tea Latte",
      shop_sid: 41,
      price: 45,
      products_type_sid: 1002,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 45,
      note: "手工烹煮麥茶ｘ牧場綠光鮮奶，麥香細緻醇滑｜※無咖啡因｜總熱量(最高)169 Kcal·總糖量(最高)25g",
      src: "product117.jpg",
    },
    {
      sid: 20018,
      name: "醇濃紅茶鮮豆奶 Fresh Soybean Milk with Traditional Black Tea",
      shop_sid: 41,
      price: 55,
      products_type_sid: 1003,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 55,
      note: "大正紅茶清爽，融合香濃豆漿(真的好濃厚)，滋味輕盈滑順｜【Ｌ】總熱量(最高)241 Kcal·總糖量(最高)33g",
      src: "product118.jpg",
    },
    {
      sid: 20019,
      name: "伯爵紅茶鮮豆奶 Fresh Soybean Milk with Black Tea",
      shop_sid: 41,
      price: 55,
      products_type_sid: 1003,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 55,
      note: "伯爵佛手柑香氣濃郁，融合豆香及醇厚質地，風味層次感豐富｜【Ｌ】 總熱量(最高)251 Kcal·總糖量(最高)32g",
      src: "product119.jpg",
    },
    {
      sid: 20020,
      name: "茉香綠茶鮮豆奶 Fresh Soybean Milk with Green Tea",
      shop_sid: 41,
      price: 55,
      products_type_sid: 1003,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 55,
      note: "清新茉莉花香與香醇豆漿結合，是鮮豆奶中較清爽的一款｜【Ｌ】總熱量(最高)240 Kcal·總糖量(最高)31g",
      src: "product120.jpg",
    },
    {
      sid: 20021,
      name: "琥珀烏龍鮮豆奶 Fresh Soybean Milk with Oolong Tea",
      shop_sid: 41,
      price:55 ,
      products_type_sid: 1003,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 55,
      note: "烏龍炭焙清香搭配香醇豆漿，口感柔順，尾韻清甜｜【Ｌ】總熱量(最高)239 Kcal·總糖量(最高)31g",
      src: "product121.jpg",
    },
    {
      sid: 20022,
      name: "珍珠鮮奶 Tapioca Fresh Milk",
      shop_sid: 41,
      price: 85,
      products_type_sid: 1004,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 85,
      note: "招牌飲品TOP 3！珍珠門市手工熬煮　軟Q彈牙，咀嚼間帶有一點淡淡蜂蜜香。｜※無咖啡因｜總熱量(最高)356 Kcal ·總糖量(最高)20g",
      src: "product122.jpg",
    },
    {
      sid: 20023,
      name: "手炒黑糖鮮奶 Brown Sugar Fresh Milk",
      shop_sid: 41,
      price: 80,
      products_type_sid: 1004,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 80,
      note: "招牌飲品TOP 3！黑糖手工手炒熬煮，清甜焦香不膩口。｜※無咖啡因｜總熱量(最高)334 Kcal·總糖量(最高)41g",
      src: "product123.jpg",
    },
    {
      sid: 20024,
      name: "法芙娜純可可鮮奶 Valrhona 100% Cocoa Milk",
      shop_sid: 41,
      price:85 ,
      products_type_sid: 1004,
      available: 1,
      type: 0,
      product_order: 1,
      discount: 85,
      note: "法國頂級法芙娜100%純可可，天然可可香氣，濃郁微苦。可可粉不含糖，甜度建議最低一分甜｜總熱量(最高)312 Kcal·總糖量(最高)36g",
      src: "product124.jpg",
    },
  ];

  // 把這個商品的基本資料填入
  for (let i = 0; i < product_data.length; i++) {
    const {
      sid,
      name,
      shop_sid,
      price,
      products_type_sid,
      available,
      type,
      product_order,
      discount,
      note,
      src,
    } = product_data[i];
    const product_sql =
      "INSERT INTO `products`(`sid`, `name`, `shop_sid`, `price`, `products_type_sid`, `available`, `type`, `product_order`, `discount`, `note`, `src`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    const [product_result] = await db.query(product_sql, [
      sid,
      name,
      shop_sid,
      price,
      products_type_sid,
      available,
      type,
      product_order,
      discount,
      note,
      src,
    ]);
  }

  // // 新增此新商品下可以選擇的客製化選項群組的資料表
  // const product_option_sql =
  //   "INSERT INTO `options_types_products_relation`( `product_sid`, `options_type_sid`) VALUES (?,?)";
  // // 將一個一個的options_type跟新商品建立關係
  // if (options_types && options_types.length > 0) {
  //   for (let i = 0; i < options_types.length; i++) {
  //     const [product_option_result] = await db.query(product_option_sql, [
  //       product_result.insertId,
  //       options_types[i],
  //     ]);
  //     // console.log(product_option_result);
  //   }
  // }
  res.send("ok");
});

router.post("/:shop_sid", upload.single("avatar"), async (req, res) => {
  console.log("post");
  console.log(req.file);
  console.log(req.body);
  const { shop_sid } = req.params;
  let { name, price, type, note, discount, options_types, available } =
    req.body;
  console.log(name, price, type, note, discount, options_types, available);

  const output = {
    success: false,
    error: "",
    postData: [req.body, req.file],
  };

  // 找到新增的這個product是那個type，取得這個type裡商品的總數，+1當作這個新商品的order
  const order_sql =
    "SELECT COUNT(1) num FROM `products_types` pt LEFT JOIN `products` p ON   pt.sid = p.products_type_sid WHERE pt.sid=?";
  const [[{ num: order }]] = await db.query(order_sql, [type]);

  // 找到上傳圖片的路徑名稱(檔名)，當作資料表中的src
  const src = req.file ? req.file.filename : "";
  available = available ? 1 : 0;
  discount = price;
  if (typeof options_types === "string") {
    console.log(typeof options_types);
    options_types = [Number(options_types)];
  }
  options_types = options_types ? options_types : [];

  // 把這個商品的基本資料填入
  const product_sql =
    "INSERT INTO `products`( `name`, `price`, `product_order`, `products_type_sid`,`shop_sid`, `src`, `note`, `available`, `discount`) VALUES (?,?,?,?,?,?,?,?,?)";
  const [product_result] = await db.query(product_sql, [
    name,
    price,
    order,
    type,
    shop_sid,
    src,
    note,
    available,
    discount,
  ]);

  // 新增此新商品下可以選擇的客製化選項群組的資料表
  const product_option_sql =
    "INSERT INTO `options_types_products_relation`( `product_sid`, `options_type_sid`) VALUES (?,?)";
  // 將一個一個的options_type跟新商品建立關係
  if (options_types && options_types.length > 0) {
    for (let i = 0; i < options_types.length; i++) {
      const [product_option_result] = await db.query(product_option_sql, [
        product_result.insertId,
        options_types[i],
      ]);
      console.log(product_option_result);
    }
  }
  res.json(output);
});

// 修改一筆資料，params傳入的值是要修改的product_sid
router.put("/:shop_sid", upload.single("avatar"), async (req, res) => {
  //  const {sid} = req.params;
  console.log("put");
  const { shop_sid } = req.params;
  let { sid, name, price, type, note, discount, options_types, available } =
    req.body;
  console.log(req.body);
  const output = {
    success: false,
    error: "",
    postData: [req.body, req.file],
  };

  // 找到上傳圖片的路徑名稱(檔名)，當作資料表中的src
  const src = req.file ? req.file.filename : "";
  available = available ? 1 : 0;
  discount = price;
  if (typeof options_types === "string") {
    console.log(typeof options_types);
    options_types = [Number(options_types)];
  }
  options_types = options_types ? options_types : [];

  try {
    // 如果有上傳新的圖片，就取代原有的src
    if (src && src !== "") {
      const product_sql =
        "UPDATE `products` SET `name`=?,`price`=?,`products_type_sid`=?,`src`=?,`note`=?,`available`=?,`discount`=? WHERE sid=?";
      const [result] = await db.query(product_sql, [
        name,
        price,
        type,
        src,
        note,
        available,
        discount,
        sid,
      ]);
    } else {
      // 如果沒有上傳新的圖片，就不更改原有的src。
      const product_sql =
        "UPDATE `products` SET `name`=?,`price`=?,`products_type_sid`=?,`note`=?,`available`=?,`discount`=? WHERE sid=?";
      const [result] = await db.query(product_sql, [
        name,
        price,
        type,
        note,
        available,
        discount,
        sid,
      ]);
    }

    // 先刪除這個商品跟所有option_type的關係
    const delete_relation_sql =
      "DELETE FROM `options_types_products_relation` WHERE product_sid=?";
    const [delete_relation_result] = await db.query(delete_relation_sql, [sid]);

    // 重新新增商品跟勾選option_type的關係
    const insert_relation_sql =
      "INSERT INTO `options_types_products_relation`(`product_sid`, `options_type_sid`) VALUES (?,?)";
    for (let i = 0; i < options_types.length; i++) {
      const [insert_relation_result] = await db.query(insert_relation_sql, [
        sid,
        options_types[i],
      ]);
      // console.log(`insert_relation_result-${i} : `, insert_relation_result);
    }

    // console.log("result : ", result);
    // console.log("delete_relation_result : ", delete_relation_result);
    // if (result.affectedRows && delete_relation_result.affectedRows) {
    //   output.success = true;
    // }
  } catch (e) {
    if (!e) {
      output.success = true;
    }
    output.error = e;
  }

  res.json(output);
  console.log(output);
});

// 刪除快速填入product
router.delete("/demo-data", upload.none(), async (req, res) => {
  for (let i = 20001; i <= 20024; i++) {
    const sql = "DELETE FROM `products` WHERE sid=?";
    const [result] = await db.query(sql, [i]);
  }
  res.send("OK");
});

router.delete("/:sid", upload.none(), async (req, res) => {
  const { sid } = req.params;
  const sql = "DELETE FROM `products` WHERE sid=?";
  const [result] = await db.query(sql, [sid]);
  res.json(result);
  console.log(result);
});

// router.get("/edit-form", upload.none(), async (req, res) => {
//   console.log(123);
//   const { sid } = req.query;

//   const data = {
//     shop: {},
//     types: {},
//     product: {},
//     options_types: {},
//     options: {},
//     only_options_types: {},
//   };

//   const shop_sql =
//     "SELECT s.* FROM `shop` s LEFT JOIN `products` p ON p.shop_sid=s.sid WHERE p.sid=?";
//   const [[shop_rows]] = await db.query(shop_sql, [sid]);

//   const type_sql = "SELECT * FROM products_types WHERE shop_sid=?";
//   const [type_rows] = await db.query(type_sql, [shop_sid]);

//   const product_sql = "SELECT * FROM `products` WHERE sid=?";
//   const [[product_rows]] = await db.query(product_sql, [sid]);

//   const option_type_sql =
//     "SELECT ot.*, otpr.product_sid FROM `options_types` ot LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
//   const [option_type_rows] = await db.query(option_type_sql, [sid]);

//   const option_sql =
//     "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.sid=?";
//   const [option_rows] = await db.query(option_sql, [sid]);

//   const only_option_type_sql =
//     "SELECT * FROM `options_types` WHERE `shop_sid`=?";
//   const [only_option_type_rows] = await db.query(only_option_type_sql, [
//     shop_rows.sid,
//   ]);

//   data.shop = shop_rows;
//   data.types = type_rows;
//   data.product = product_rows;
//   data.options_types = option_type_rows;
//   data.options = option_rows;
//   data.only_options_types = only_option_type_rows;

//   console.log(data);
//   res.json(data);
// });

module.exports = router;
