const session = require("express-session");
const DB = require(__dirname + '/ConnectDataBase');
const mySqlStore = require("express-mysql-session")(session);
const sessionStore = new mySqlStore({}, DB);
const sessionParser =  session({
  //未初始化時是否儲存
  saveUninitialized: false,
  //是否儲存
  resave: false,
  //加密植
  secret: "fdsfdsfsf54564SDFSA64f465AadsrfdesfesTGEFDAT",
  //session存到資料庫
  store: sessionStore,
  //cookie設定
  cookie: {
      //最長存在時間ms 數字加底線一樣有用
      maxAge: 3_600_000
      // originalMaxAge: null,
      // expires: null,
      // httpOnly: true,
      // path: "/"
  }
})
module.exports = sessionParser 