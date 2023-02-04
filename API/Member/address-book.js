const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../../Modules/ConnectDataBase');
const upload = require('../../Modules/Upload_Imgs');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const app = express();
const cors = require('cors');
const multer = require("multer");
const fs = require("fs").promises;
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")




// enable files upload
// 啟動檔案上傳
app.use(fileUpload({
    createParentPath: true
}));

// 加入其它的middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

//讓uploads目錄公開
// https://expressjs.com/zh-tw/starter/static-files.html
//app.use(express.static('uploads'));
// 如果想要改網址路徑用下面的
// 您可以透過 /static 路徑字首，來載入 uploads 目錄中的檔案。
app.use('/uploads', express.static('uploads'));

async function getListData(req, res) {
    const perPage = 20;
    let page = +req.query.page || 1;
    if (page < 1) {
        return res.redirect(req.baseUrl); // api 時不應該轉向
    }

    let search = req.query.search ? req.query.search.trim() : '';
    let where = ` WHERE 1 `;
    if (search) {
        where += ` AND 
        (
            \`name\` LIKE ${db.escape('%' + search + '%')}
            OR
            \`email\` LIKE ${db.escape('%' + search + '%')}
        ) `;
    }

    const t_sql = `SELECT COUNT(1) totalRows FROM member ${where}`;
    const [[{ totalRows }]] = await db.query(t_sql);

    let totalPages = 0;
    let rows = [];
    if (totalRows > 0) {
        totalPages = Math.ceil(totalRows / perPage);
        if (page > totalPages) {
            return res.redirect(`?page=${totalPages}`);
        }
        const sql = `SELECT * FROM member ${where} ORDER BY sid DESC LIMIT ${(page - 1) * perPage}, ${perPage} `;
        [rows] = await db.query(sql);
    }
    return { totalRows, totalPages, perPage, page, rows, search, query: req.query };
}
// CRUD

// 新增資料
router.get('/add', async (req, res) => {
    res.locals.title = '新增資料 | ' + res.locals.title;
    res.render('address-book/add')
});

const authController = (req, res) => {
    // const { email, password ,name} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

}
// router.post('/add',(req,res,next)=>{

//     console.log(req.body);
//     next()
// })

router.post('/add',
    upload.single('avatar')
    , body('email').
        isEmail()
        .withMessage("email格式錯誤"), // 檢查 req.body.email 是否為 email 格式
    body('password')
        .trim()
        .isLength({ min: 9 })
        .withMessage("密碼格式錯誤"),
    body('phone')
        .trim()
        .isLength(10)
        .withMessage("手機格式錯誤"),
    body("doublepassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("密碼不吻合"); // 兩次輸入的密碼不相同
            }
            return true;
        }),
    (req, res, next) => {
        console.log(req.body);
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }
    // 檢查 req.body.password 去除空白後長度是否為 8 (含)個字元以上
    //   body("name")
    //     .trim()
    //     .isLength({ min: 1 })
    //     .withMessage("USERNAME_INVALID"), // 帳號必填, 且至少 6 個字元以上
    ,
    // upload.single('avatar'),
    async (req, res) => {
        const h = await bcrypt.hash(req.body.password,10);
        console.log(req.body);
        try {
            if (!req.file) {
                const sql = "INSERT INTO `member`(`email`, `password`,`name`,`phone`,`image`,`point`) VALUES (?,?,?,?,?,'1000')";
                const image = null;
                const [result] = await db.query(sql, [
                    req.body.email,
                    h,
                    req.body.name,
                    req.body.phone,
                    { image },]
                );
                const a='SELECT sid FROM `member`  ORDER BY sid DESC LIMIT 0 , 1'
                const [re]=await db.query(a)
                const b=re[0].sid

                const pointDetailsql = "INSERT INTO `point_detail`(`member_sid`,`point_amount`,`point_change_time`,`point_change_method`) VALUES(?,1000,NOW(),2)";

                const [pointData] = await db.query(pointDetailsql,[b]);
                res.send({
                    code: 0,
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'No file uploaded'
                });
                // console.log([result]);
            } else {
                let avatar = req.file;
                console.log('try');
                /*
                        //使用輸入框的名稱來獲取上傳檔案 (例如 "avatar")
                        const ext = extMap[avatar.mimetype];
                        avatar.name=uuidv4()+ext
                      //   avatar.name=uuidv4()
                        //使用 mv() 方法來移動上傳檔案到要放置的目錄裡 (例如 "uploads")
                        avatar.mv('./uploads/' + avatar.name);
                */


                const sql = "INSERT INTO `member`(`email`, `password`,`name`,`phone`,`image`,`point`) VALUES (?,?,?,?,?,'1000')";
                const image = avatar.filename;
                console.log(image);
                const [result] = await db.query(sql, [
                    req.body.email,
                    h,
                    req.body.name,
                    req.body.phone,
                    req.file.filename,
                ]);
                console.log([result]);
                const a='SELECT sid FROM `member`  ORDER BY sid DESC LIMIT 0 , 1'
                const [re]=await db.query(a)
                const b=re[0].sid

                const pointDetailsql = "INSERT INTO `point_detail`(`member_sid`,`point_amount`,`point_change_time`,`point_change_method`) VALUES(?,1000,NOW(),2)";

                const [pointData] = await db.query(pointDetailsql,[b]);


                //送出回應
                res.json({
                    code: 0,
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: avatar.filename,
                        mimetype: avatar.mimetype,
                        size: avatar.size
                    },
                    file: req.file
                });
                // console.log(req.files);
                // console.log(req.files.avatar.name);

                //    if(result.affectedRows) output.success = true;
                //    res.json(output);

            }
        } catch (err) {
            res.status(500).json(err);
        }

        // TODO: 檢查欄位的格式, 可以用 joi
        // console.log(req.body.name);
        // const sql = "INSERT INTO `member`(`email`, `password`) VALUES (?,?)";
        // const [result] = await db.query(sql, [
        //     req.body.email,
        //     req.body.password,
        // ]);
        // console.log(req.body);

        // if(result.affectedRows) output.success = true;
        // res.json(output);

    });

// 修改資料
router.get('/edit', async (req, res) => {
    const sql = " SELECT * FROM member WHERE sid=?";
    const [rows] = await db.query(sql, [req.query.sid]);
    res.json(rows);
});
router.put('/edit/:sid', upload.single('avatar'),
    body('phone')
        .trim()
        .isLength(10)
        .withMessage("手機格式錯誤"),
    (req, res, next) => {
        console.log(req.body);
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }, async (req, res) => {
        console.log(req.params.sid);
        // TODO: 檢查欄位的格式, 可以用 joi
        try {
            if (!req.file) {

                const sql = "UPDATE member SET name=?,phone=? WHERE sid=?";
                const image = null;
                const [result] = await db.query(sql, [
                    req.body.name,
                    req.body.phone,
                    req.params.sid
                ]);
                res.send({
                    code: 200,
                    error: {},
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'No file uploaded'
                });
                // console.log(result);
                // if(result.affectedRows) output.success = true;
                // if(result.changedRows) output.success = true;
                // res.json(output);
            } else {
                const avatar = req.file
                console.log("111111");
                console.log(req.file);
                console.log(req.file.filename);
                const sql = "UPDATE member SET name=?,phone=?,image=? WHERE sid=?";
                const [result] = await db.query(sql, [
                    req.body.name,
                    req.body.phone,
                    req.file.filename,
                    req.params.sid
                ]);
                res.json({
                    code: 200,
                    error: {},
                    message: {},
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: avatar.filename,
                        mimetype: avatar.mimetype,
                        size: avatar.size
                    },
                    file: req.file
                });
                // console.log(result);
            }
        } catch (err) {

            res.status(500).json(err);
        }

    });

router.delete('/del/:sid/:i', async (req, res) => {
    // consele.log(req.body)
    const sql = " DELETE FROM favorite_shop WHERE member_sid=? && shop_sid=?";
    const [result] = await db.query(sql,[req.params.sid,req.params.i]);
    res.json({ success: !!result.affectedRows, result });
});

//
router.get('/item/:id', async (req, res) => {
    // 讀取單筆資料
});

router.get(['/', '/list'], async (req, res) => {
    const data = await getListData(req, res);

    res.render('address-book/list', data);
});

router.get(['/api', '/api/list'], async (req, res) => {
    res.json(await getListData(req, res));
});

router.get('/api2/:sid', async (req, res) => {
    // const {sid} = req.params;g
    console.log(req.params.sid);
    const sql = "SELECT * FROM member WHERE sid=?";
    const [result] = await db.query(sql, [
        req.params.sid,
    ]);
    console.log(result);
    res.json(result);
});


router.get('/api3/:sid', async (req, res) => {
    // const {sid} = req.params;g
    // console.log(req.params.sid);
    const sql = "SELECT favorite_shop.*, shop.name,shop.address,shop.phone,shop.src FROM favorite_shop JOIN shop ON favorite_shop.shop_sid = shop.sid WHERE member_sid=?";
    const [result] = await db.query(sql, [
        req.params.sid,
    ]);
    // console.log(result);
    res.json(result);
});

router.get('/api4', async (req, res) => {

    const sql = "SELECT * FROM shop";
    const [result] = await db.query(sql);
    console.log(result);
    res.json(result);
});

router.get('/api5/:sid', async (req, res) => {

    const sql = "SELECT c.*, cc.`coupon_name`, cc.`use_range`, cc.`sale_detail`, cc.`shop_sid`, s.name FROM `coupon` c LEFT JOIN  `coupon_content` cc ON  c.`coupon_sid` = cc.`sid` LEFT JOIN `shop` s ON s.`sid` = cc.`shop_sid` WHERE c.`member_sid` = ?";
    const [result] = await db.query(sql,[req.params.sid]);
    console.log(result);
    res.json(result);
});

router.post('/addshop/:sid/:i', upload.none(), async (req, res) => {
    // console.log(req.body);
    // const output = {
    //     code: 0,
    //     error: {},
    //     postData: req.body, // 除錯用
    // };

    const sql = "INSERT INTO `favorite_shop`(`member_sid`, `shop_sid`) VALUES (?,?)";
    const [result] = await db.query(sql,[req.params.sid,req.params.i]);
    console.log(req.params.i)
    res.json(result);

});

router.delete('/del2/:sid', async (req, res) => {
    console.log('body'+ JSON.stringify( req.body))
    const sql = " DELETE FROM favorite_shop WHERE member_sid=? && shop_sid=?";
    // console.log(req.body.shop_sid);
    const [result] = await db.query(sql,[req.params.sid,req.body.shop]);
    res.json({ success: !!result.affectedRows, result });
});

router.get('/api6', async (req, res) => {

    const sql = "SELECT * FROM member ORDER BY sid DESC LIMIT 0 , 1";
    const [result] = await db.query(sql);
    console.log(result);
    res.json(result);
});

router.put('/edit2/:sid', upload.none(),

    body('password')
        .trim()
        .isLength({ min: 9 })
        .withMessage("密碼格式錯誤"),
    body("doublepassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("密碼不吻合"); // 兩次輸入的密碼不相同
            }
            return true;
        }),
    (req, res, next) => {
        console.log(req.body);
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }, async (req, res) => {
        console.log(req.params.sid);
        const output = {
            success: false,
            code: 0,
            error: '修改失敗',
            postData: req.body, // 除錯用
        };

        // TODO: 檢查欄位的格式, 可以用 joi
       
                const sql2 = "SELECT password FROM member WHERE sid=?";
                const [result2] = await db.query(sql2, [
                    req.params.sid
                ]);
                const a=result2[0].password;
                console.log(a);
                console.log(req.body.original);
                const p=await bcrypt.compare(req.body.original, a)
                console.log(p);
                if(p){
                    const h = await bcrypt.hash(req.body.password,10);
                    const sql = "UPDATE member SET password=? WHERE sid=?";
                    const [result] = await db.query(sql, [
                        h,
                        req.params.sid
                    ]);
                    return res.json(1);
                }else{
                    return res.json(0)
                }
    });

    router.post("/forgotPass/api", upload.none(), async (req, res) => {
        const sql = "SELECT * FROM `member` WHERE `email` = ?"
      
        const [result] = await db.query(sql, [req.body.email])
        console.log(result[0]);
        if (!result[0]) {
          return res.json({message: "密碼重置信已寄出"})
        }
     
      
        const token = jwt.sign(
            { member_sid: result[0].sid },
            "hiking1214" + result[0].password
          )
        console.log(token);
        // const verifiedToken = jwt.verify(token, "hiking1214" + result[0].password)
      
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
          auth: {
            user: "thay279931@gmail.com",
            pass: "exuniirxweyyasyk",
          },
        })
      
        transporter.sendMail(
          {
            from: "thay279931@gmail.com",
            to: "noreg0351091@gmail.com",
            subject: "會員密碼重設",
            text: `您好\n\n請點選下列網址，完成密碼重設的手續。\n\nhttp://localhost:3000/Member/resetPass?token=${token}&mid=${result[0].sid}\n\n■ 若您未曾在隨饗設定本電子郵件帳號，這表示其他用戶很可能輸入錯誤的信箱帳號，\n導致系統傳送本封郵件至此信箱內。\n請直接刪除本封郵件即可。`,
          },
          (err) => {
            console.log("寄件錯誤:" + err)
          }
        )
      
        return res.json({message: "密碼重置信已寄出", token: token})
      })

        router.post("/resetPass/api", upload.none(), async(req, res)=> {
        const sqlCheckOldPass = "SELECT * FROM `member` WHERE `sid` = ?"
      
        const [result] = await db.query(sqlCheckOldPass, [req.query.mid])
      
       
        if (!result[0] || !result[0].password) {
    return res.json({message: "帳號不存在"})
  }

  let jwtInfo = {}

  try {jwt.verify(req.query.token, "hiking1214" + result[0].password)}
  catch {
    return res.json({message: "重置密碼連結無效"})
  }

  jwtInfo = jwt.verify(req.query.token, "hiking1214" + result[0].password)
  console.log(jwtInfo)
  if (bcrypt.compareSync(req.body.password, result[0].password)) {
    return res.json({message: "新密碼不可與目前密碼相同"})
  }

  const newPassBcrypt = bcrypt.hashSync(req.body.password, 10)

  const sqlNewPass = "UPDATE `member` SET `password` = ? WHERE `sid` = ?"

  const [resultM] = await db.query(sqlNewPass, [newPassBcrypt, jwtInfo.member_sid])

  if(resultM) {
    const token = jwt.sign({ member_sid: jwtInfo.member_sid }, "hiking1214")
    return res.json({message: "密碼重置成功", token: token})
  }

  return res.json({message: "密碼重置失敗"})
})
      


module.exports = router;