const express = require("express");
const router = express.Router();
const DB = require("./ConnectDataBase");
const moment = require("moment-timezone");

//獲得正整數範圍，有含上限(最小值,最大值)
function getIntRange(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

//獲得正整數 含輸入的數到0
function getIntTo0(x) {
  return Math.floor(Math.random() * (x + 1));
}
//獲得正整數 含輸入的數到1
function getIntTo1(x) {
  return Math.floor(Math.random() * x + 1);
}

const roadsNS = ['新生','環河','中山','復興','敦化','光復','西寧']
const roadsWE = ['忠孝','長安','南京','民生','民權','民族','和平']
const roadsND = ['信義','仁愛','中華','大安','基隆','安和','辛亥']
const roadList = [roadsNS,roadsWE,roadsND]
const directionNS = ['南','北']
const directionWE = ['東','西']
const directionND = ['','']
const drList = [directionNS,directionWE,directionND]

const ams = ['炸雞','漢堡','牛排','美式餐廳']
const amsImg = ['amF','amH','amS','amR']
const amsProduct = ['炸雞','漢堡','牛排','美式料理']
const jps = ['壽司','拉麵','丼','日本料理']
const jpsImg = ['jpS','jpN','jpD','jpR']
const jpsProduct = ['壽司','拉麵','丼','日式料理']
const chs = ['麵店','小吃店','便當','豆漿店']
const chsImg = ['chN','chR','chB','chS']
const chsProduct = ['麵','小吃','便當','豆漿']
const its = ['義大利麵','義式廚房',' PASTA','比薩']
const itsImg =['italyN','italyR','italyN','italyP']
const itsProduct = ['義大利麵','義式料理','焗烤義大利麵','比薩']
const dks = ['咖啡','冷飲','果汁吧','鮮茶']
const dksImg = ['dkC','dkD','dkF','dkT']
const dksProduct = ['咖啡','氣泡飲','果汁','綠茶']
const dss = ['蛋糕','豆花','冰品','甜點坊']
const dssImg = ['dsC','dsB','dsI','dsR']
const dssProduct = ['蛋糕','豆花','刨冰','泡芙']

//===============================================分隔線================================================

const nameList = ['好吃','平價','好再來','老饕','隨意','源味','優質','好饗','饗餚','餚享','家鄉','佳好','原食']//13個

//===============================================分隔線================================================

const types = [0,ams,jps,chs,its,dks,dss]
const imgList = [0,amsImg,jpsImg,chsImg,itsImg,dksImg,dssImg]
const productList = [0,amsProduct,jpsProduct,chsProduct,itsProduct,dksProduct,dssProduct]

//===============================================分隔線================================================
//Setfakedata/SetNewFakeShop  Setfakedata/updateProductOld100
//  <1101  33~40 52~60  90~100

//const sql = "INSERT INTO `products`(`sid`, `name`, `shop_sid`, `price`, `products_type_sid`, `available`, `type`, `product_order`, `discount`, `note`, `src`) VALUES ()"


router.get('/updateProductOld100',async(req,res)=>{
  for (let i = 1 ;i<=1101;i++){
    const sql = "UPDATE `products` SET `src`=? WHERE `sid` = ?"
    const srcName = 'store' + i + '.jpg'
    const getSrc = imgList[getIntTo1(6)][getIntTo0(3)] + getIntTo1(8) + '.jpg'
    await DB.query(sql,[getSrc,i])
  }
  res.json(1)
})


router.get('/updateOld100',async(req,res)=>{
  for (let i = 0 ;i<100;i++){
    const sql = "UPDATE `product` SET `src`=? WHERE `sid` = ?"
    const srcName = 'store' + i + '.jpg'
    await DB.query(sql,[srcName,i])
  }
  res.json(1)
})

const firstNameList = ['陳','林','黃','張','李','王','吳','劉','蔡','楊']
const lastNameList = ['冠廷','雅婷','冠宇','雅筑','怡君','宗翰','家豪','佳穎','怡萱','彥廷','承翰','宜庭','郁婷','柏翰','宇軒','怡婷','詩涵','家瑋','冠霖','鈺婷']

//假會員資料
router.use("/getMemberData", async (req, res) => {
  for (let index = 0; index < 100; index++) {
    const phone = ('09' + getIntTo0(99999999) +'0123456789').slice(0,10)
    const email = 'M' + phone
    const password = 'M' + phone + 'PS'
    const name = firstNameList[getIntTo0(9)] + lastNameList[getIntTo0(19)]
    const image = 'memberAvatar' + getIntTo1(20) + '.png'
    const sql = "INSERT INTO `member`(`name`, `email`, `password`, `phone`,`image`) VALUES (?,?,?,?,?)"
    const datas = [name,email,password,phone,image]
    const [{insertId}] = await DB.query(sql,datas)
  }

  res.json(1)
})

router.get("/SetNewFakeShop", async (req, res) => {
  for (let i = 0 ;i<100;i++){
    const foodType = getIntTo1(6)
    const shopNameIndex = getIntTo0(3)
    const shopName = nameList[getIntTo0(12)] + types[foodType][shopNameIndex]
  
    const phone = ('09' + getIntTo0(99999999) +'0123456789').slice(0,10)
    const email = 'S' + phone
    const password = 'S' + phone + 'PS'
  
  
    const getRoadType = getIntTo0(2)
    const address = '台北市'+ roadList[getRoadType][getIntTo0(6)] + drList[getRoadType][getIntTo0(1)] + '路' + getIntTo1(100) + '號'
  
    const bus_start = 0830
    const bus_end = 1730
    const src = imgList[foodType][shopNameIndex] + getIntTo1(8) + '.jpg'
    const waitTime = getIntTo1(10) * 5
    const eva = getIntTo1(50) / 10
  
    const datas = [shopName,email,password,address,phone,foodType,bus_start,bus_end,1,src,waitTime,eva]
  
    const sql = "INSERT INTO `shop`(`name`, `email`, `password`, `address`, `phone`, `food_type_sid`, `bus_start`, `bus_end`, `rest_right`, `src`, `wait_time`, `average_evaluation`) VALUES (?,?,?,?,? ,?,?,?,?,? ,?,?)"
    const [{insertId}] = await DB.query(sql,datas)

    for (let i=0;i<5;i++){
      const getName = productList[foodType][getIntTo0(3)]
      const getNote = getName
      const getSrc = imgList[foodType][getIntTo0(3)] + getIntTo1(8) + '.jpg'
      const productSql = "INSERT INTO `products`(`name`, `shop_sid`, `price`, `products_type_sid`, `available`, `type`, `product_order`, `discount`, `note`, `src`) VALUES (?,?,100,1,1,?,0,100,?,?)"
      const insertDatas = [getName,insertId,foodType,getNote,getSrc]
      const result = await DB.query(productSql,insertDatas)
    }
  }
  res.json(1)
})
//Setfakedata/updateOld100EmptyProduct
router.get("/updateOld100EmptyProduct", async (req, res) => {
  //33~40 52~60  90~100
  const shopList = [33,34,35,36,37,38,39,40,52,53,54,55,56,57,58,59,60,90,91,92,93,94,95,96,97,98,99,100]
  for(let element of shopList){
    const shopSid = element
    for (let i=0;i<5;i++){
      const foodType = getIntTo1(6)
      const getName = productList[foodType][getIntTo0(3)]
      const getNote = getName
      const getSrc = imgList[foodType][getIntTo0(3)] + getIntTo1(8) + '.jpg'
      const productSql = "INSERT INTO `products`(`name`, `shop_sid`, `price`, `products_type_sid`, `available`, `type`, `product_order`, `discount`, `note`, `src`) VALUES (?,?,100,1,1,?,0,100,?,?)"
      const insertDatas = [getName,shopSid,foodType,getNote,getSrc]
      const result = await DB.query(productSql,insertDatas)
    }
  }

  res.json(1)
})









//修正店家資料
router.get('/updateShopDatas',async(req,res)=>{

  const sql ="UPDATE `shop` SET `wait_time`= ? WHERE sid= ? "
  for(let i = 1 ;i<100;i++){
    // const phone = ('09' + getIntTo0(99999999) +'0123456789').slice(0,10)
    const eva = getIntTo1(10) * 5
    await DB.query(sql,[eva,i])    
  }
  res.json(1)
})
//隨機生成已完成訂單用
router.get("/randomOrder", async (req, res) => {
  const oneHour = 3600 * 1000;
  const hourPerWeek = 24 * 7;
  const newOrderDate = getIntRange(5, hourPerWeek) * oneHour;
  const newDay = new Date(new Date() - newOrderDate) ;

  //1107  總數
  const product1Amount = getIntTo1(5);
  //1108 總數
  const product2Amount = getIntTo1(6);

  const order_total = product1Amount * 120 + product2Amount * 155;
  const sale = order_total;
  const fee = getIntTo1(6) * 5;
  const total_amount = product1Amount + product2Amount;
  //1107 120
  //1108 155

  // return res.json(newDay);

  const orderSql =
    "INSERT INTO `orders`(`member_sid`, `shop_sid`, `deliver_sid`,`order_time`, `order_total`, `sale`, `paid`, `pay_method`, `deliver_fee`, `shop_order_status`, `deliver_order_status`, `total_amount`, `receive_name`, `receive_phone`, `receive_address`, `order_complete`) VALUES (1,89,1,?,?,?,1,0,?,1,1,?,'陳資展','0912345678','台北市大安區復興南路一段390號2樓',0)";

  const orderDetail = [newDay, order_total, sale, fee, total_amount];

  const [{ insertId: orderSid }] = await DB.query(orderSql, orderDetail);

  const detailSql =
    "INSERT INTO `order_detail`( `order_sid`, `product_sid`, `product_price`, `amount`) VALUES (?,?,?,?)";

  const productDetail1 = [orderSid, 1107, 120, product1Amount];

  const productDetail2 = [orderSid, 1108, 155, product2Amount];

  await DB.query(detailSql, productDetail1);
  await DB.query(detailSql, productDetail2);

  const shopOrderSql =
    "INSERT INTO `shop_order`(`member_sid`, `deliver_sid`, `order_sid`, `shop_accept_time`, `shop_complete_time`, `deliver_take`, `shop_sid`, `cook_finish`) VALUES (1,1,?,?,?,1,89,1)";
  const shop_accept_time =new Date(newDay.getTime() + oneHour)  ;
  const shop_complete_time = new Date(newDay.getTime() + oneHour * 2) ;
  const shopOrderDetail = [orderSid, shop_accept_time, shop_complete_time];

  const [{ insertId: shopOrderSid }] = await DB.query(
    shopOrderSql,
    shopOrderDetail
  );

  const deliverOrderSql =
    "INSERT INTO `deliver_order`( `member_sid`, `shop_sid`, `deliver_sid`, `store_order_sid`, `order_sid`,  `deliver_take_time`, `complete_time`, `order_finish`, `deliver_fee`,deliver_check_time) VALUES (1,89,1,?,?,?,?,1,?,?)";

  const deliver_take_time = new Date(newDay.getTime() + oneHour * 3) ;
  const complete_time = new Date(newDay.getTime() + oneHour * 4) ;
  const deliverOrderDetail = [
    shopOrderSid,
    orderSid,
    null,
    complete_time,
    fee,
    deliver_take_time
  ];
  console.log(deliverOrderDetail);
  const [{ insertId: deliverOrderSid }] = await DB.query(
    deliverOrderSql,
    deliverOrderDetail
  );

  const updateShopOrderSql =
    " UPDATE `shop_order` SET `deliver_order_sid`=? WHERE `order_sid` = ?";

  await DB.query(updateShopOrderSql, [deliverOrderSid, orderSid]);

  const updateOrderSql =
    "UPDATE `orders` SET `store_order_sid`= ?,`deliver_order_sid`=? WHERE `sid` = ?";

  await DB.query(updateShopOrderSql, [shopOrderSid,deliverOrderSid,orderSid]);
  console.log(orderSid);
  res.json(orderSid);
});

router.get("/RandomOrderStep4", async (req, res) => {
  const oneHour = 3600 * 1000;
  const hourPerWeek = 24 * 7;
  const newOrderDate = getIntRange(5, hourPerWeek) * oneHour;
  const newDay = new Date(new Date() - newOrderDate) ;

  //1107  總數
  const product1Amount = getIntTo1(5);
  //1108 總數
  const product2Amount = getIntTo1(6);

  const order_total = product1Amount * 120 + product2Amount * 155;
  const sale = order_total;
  const fee = getIntTo1(6) * 5;
  const total_amount = product1Amount + product2Amount;
  //1107 120
  //1108 155

  // return res.json(newDay);

  const orderSql =
    "INSERT INTO `orders`(`member_sid`, `shop_sid`, `deliver_sid`,`order_time`, `order_total`, `sale`, `paid`, `pay_method`, `deliver_fee`, `shop_order_status`, `deliver_order_status`, `total_amount`, `receive_name`, `receive_phone`, `receive_address`, `order_complete`) VALUES (1,89,1,?,?,?,1,0,?,1,1,?,'ゆう','0912345678','台北市大安區復興南路一段390號2樓',0)";

  const orderDetail = [newDay, order_total, sale, fee, total_amount];

  const [{ insertId: orderSid }] = await DB.query(orderSql, orderDetail);

  const detailSql =
    "INSERT INTO `order_detail`( `order_sid`, `product_sid`, `product_price`, `amount`) VALUES (?,?,?,?)";

  const productDetail1 = [orderSid, 1107, 120, product1Amount];

  const productDetail2 = [orderSid, 1108, 155, product2Amount];

  await DB.query(detailSql, productDetail1);
  await DB.query(detailSql, productDetail2);

  const shopOrderSql =
    "INSERT INTO `shop_order`(`member_sid`, `deliver_sid`, `order_sid`, `shop_accept_time`, `shop_complete_time`, `deliver_take`, `shop_sid`, `cook_finish`) VALUES (1,1,?,?,?,1,89,1)";
  const shop_accept_time =new Date(newDay.getTime() + oneHour)  ;
  const shop_complete_time = new Date(newDay.getTime() + oneHour * 2) ;
  const shopOrderDetail = [orderSid, shop_accept_time, shop_complete_time];

  const [{ insertId: shopOrderSid }] = await DB.query(
    shopOrderSql,
    shopOrderDetail
  );

  const deliverOrderSql =
    "INSERT INTO `deliver_order`( `member_sid`, `shop_sid`, `deliver_sid`, `store_order_sid`, `order_sid`,  `deliver_take_time`, `complete_time`, `order_finish`, `deliver_fee`,deliver_check_time) VALUES (1,89,1,?,?,?,?,1,?,?)";

  const deliver_take_time = new Date(newDay.getTime() + oneHour * 3) ;
  const complete_time = new Date(newDay.getTime() + oneHour * 4) ;
  const deliverOrderDetail = [
    shopOrderSid,
    orderSid,
    null,
    complete_time,
    fee,
    deliver_take_time
  ];
  console.log(deliverOrderDetail);
  const [{ insertId: deliverOrderSid }] = await DB.query(
    deliverOrderSql,
    deliverOrderDetail
  );

  const updateShopOrderSql =
    " UPDATE `shop_order` SET `deliver_order_sid`=? WHERE `order_sid` = ?";

  await DB.query(updateShopOrderSql, [deliverOrderSid, orderSid]);

  const updateOrderSql =
    "UPDATE `orders` SET `store_order_sid`= ?,`deliver_order_sid`=? WHERE `sid` = ?";

  await DB.query(updateOrderSql, [shopOrderSid,deliverOrderSid,orderSid]);
  console.log(orderSid);
  res.json(orderSid);
});

//更新經緯度資料
//SELECT `sid`, `name`, `email`, `password`, `address`, `phone`, `food_type_sid`, `bus_start`, `bus_end`, `rest_right`, `src`, `wait_time`, `average_evaluation`, `shop_lat`, `shop_lng` FROM `shop` WHERE 1

router.get('/GetAllAddress',async(req,res)=>{
  const sql = "SELECT `sid`, `address` FROM `shop` WHERE `sid` !=101"
  const [result] = await DB.query(sql)
  res.json(result)  
})
router.post('/Updatelatlng',async(req,res)=>{
  const postData = req.body
  const updateSql = "UPDATE `shop` SET `shop_lat`=?,`shop_lng`=? WHERE `sid` = ?"
  const totalRes = []
  for (let element of postData){
    const lat = element.lat
    const lng = element.lng
    const sid = element.sid
    const [result] = await DB.query(updateSql,[lat,lng,sid])
    totalRes.push(result)
  }
  res.json(totalRes)
})

const contentList = ["",
"不試還好，試了愛上，整體而言，水準非常高阿，甚至有比我當年的記憶還更高一層次的水準。加油，真金不怕火煉，好吃的店家總是不怕別人比較，也許你們有考量可能會降低你們品牌價值或是可能他的講法對你們用心準備餐點的態度上你們不能接受，可是我只能講，我們家最少被征服了。",
"口味真的普通但價格很好濃湯好喝但紅醬很水很淡，米飯很軟不像燉飯，比較像一般煮的比較軟的飯加上醬，類似稀飯？但有口感一點，總之不是燉飯墨魚麵偏辣，但口味也是普通優點是海鮮很新鮮！價格很棒",
"東西cp值高 算很美味 份量很夠 但店員態度感覺很隨性 個人覺得很不優",
"學生價只限台大學生，雖然我也是學生，但沒有優惠QQ。",
"味道好，份量多，服務親切，結帳時店員還關心夠不夠吃，大推！",
"奶油唐揚雞麵+墨魚海鮮燉飯+A餐。人氣店家，出餐速度快。餐包是真的會爆漿，檸檬紅茶好像是飲料機的，好甜。墨魚海鮮燉飯的海鮮量很多，墨魚汁也很充分，只是飯好像沒有入味。奶油醬偏少，吃起來好乾，唐揚雞有點偏鹹，麵條軟硬度適中。味道一般般，但整體CP值中上",
"價位差不多100～150台大學生證會附一杯檸檬紅茶餐點品質還不錯",
"餐點美味！份量不大剛剛好 不膩！餐包意外的好吃 一甜一鹹下午二點多內用，一位女外場服務人員 服務態度非常好也很親切 值得嘉許也希望以後可以有純紅茶可以選擇",
"白酒蛤蜊不好吃麵上面很多一粒一粒的不知道是蒜 還是沒溶開的白醬蛤蜊也很小很瘦沒肉 玉米湯好喝 料多",
"不是評價食物好不好吃，是喜歡他們對待外送員的方式，雖然等了15分鐘左右但他們很客氣，還送我一杯檸檬紅茶，我覺得店家慢基本上不是他們的問題，畢竟一下來很多單也沒辦法，重要的是他們有沒有尊重你的感覺，這對我比較重要，當然越快越好因為多一單是一單啊哈哈。",
"佛羅倫斯奶油海鮮燉飯，醬料味道偏鹹，把奶味都蓋過去了....",
"麵量肉量都很足味道不差附湯不會稀奶油餐包一甜一鹹都好吃CP值很高！",
"路過好幾次每次都看到裡面人超多的，這次趁一開店馬上就去光臨，cp 值超高，不只是上面有寫焗烤的餐點是焗烤，還可以把其他餐點+焗烤，但還是要多加錢啦！但選擇就有很多種，而且還有專門素食的菜單，有五辛素和全素的菜單，素食者可以不用擔心喔！",
"這個價位，這個味道，沒什麼好說的，吊打台北市絕大部分的平價義大利麵，只差麵硬還是沒有麵芯而已，整體味道很棒，煙燻培根很好吃",
"食材吃的出來非常用心 服務相當好 #香蒜白酒蛤蜊湯麵 用八顆蛤蜊 大顆又新鮮 讚喔 #香辣蔬菜青醬很讚 有一點芹菜點綴 爽辣 #蘑菇海鮮燉飯 濃郁菇味搭配米香 香濃 #墨魚醬海鮮麵 有點清淡 感覺味道可以再重一點 #辣味番茄培根 培根肉大塊 大辣會辣到噴火",
"價位中等，青醬雞肉麵好吃，番茄海鮮飯不推，口感跟味道很奇怪，燙青菜比預期好吃，檸檬紅茶好喝，建議點麵類不要點飯",
"焗烤cp值高！咖哩雞肉味道也好吃",
"剛點松子青醬蛤蜊麵，根本沒半顆松子！傻眼！且店員一開始找錯錢，沒任何表示也罷，態度還不太好，不會再買了！",
"非常平價的義式料理蛤蜊給的很大顆, 但腥味滿重的...可能不太新鮮雞翅滿乾的, 最好吃的是雞塊 但在學生地方, CP值滿高的！",
"餐點選擇多樣，份量還行，焗烤肯給，佛卡夏適合當飯後甜點"
]
function getIntTo1(x) {
  return Math.floor(Math.random() * x + 1);
}
function getIntRange(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

router.get("/SetFakeShopEvas", async (req, res) => {
  for(let i = 1 ;i<101;i++){
    const oneHour = 3600 * 1000;
    const hourPerWeek = 24 * 7;
    const newOrderDate = getIntRange(5, hourPerWeek) * oneHour;
    const newDay = new Date(new Date() - newOrderDate) ;
  
    const randomScore = getIntTo1(5)
    const memberSid = getIntTo1(100)
    const orderSid = getIntRange(10000,99999) 
  
    const sql = "INSERT INTO `shop_evaluation`( `order_sid`, `member_sid`, `shop_sid`, `evaluation_score`, `evaluation_content`, `evaluation_time`) VALUES (?,?,?,?,?,?)"
    const inputDatas = [orderSid,memberSid,89,randomScore,contentList[getIntTo0(19)],newDay]
  
    const [result] = await DB.query(sql,inputDatas)
  }
  res.json(1)
})



module.exports = router;