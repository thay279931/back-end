const WebSocket = require('ws');
const DB = require('../Modules/ConnectDataBase');
const moment = require("moment-timezone");
const jwt = require('jsonwebtoken')
const createEchoServer = (server) => {
    const wsServer = new WebSocket.Server({ server });
    //===============================================分隔線================================================
    //使用方法: 前端在載入時傳入 socket.send(`{"post_side":1/2/3/4}`)
    // 1會員 2店家 3外送員 4管理者  不用0因為要進入判斷式
    // 後面發言時傳入 post_side 只有第一次要放  前端可以在收訊息時判斷有沒有read 來決定要顯示訊息或設定已讀
    //{"msg":訊息,"receive_sid":接收對象SID,"receive_side":接收方[,"post_side":發訊方][,"read",true已讀]}
    //===============================================分隔線================================================
    //回傳的訊息 msg 送出的訊息 || name 送訊息的名稱 || post_side 哪邊送的訊息 || post_sid 送訊息的SID || receive_side 接收訊息方 || receive_sid 接收訊息SID || time 訊息發送時間 || read 已讀
    // { "msg": content, "name": map.get(ws).name, "post_side": postSide, "post_sid": postSid, "receive_side": receiveSide, "receive_sid": receiveSid, "time": timeNow /*[,"read",true已讀]*/ }
    //===============================================分隔線================================================
    //直接從列表找出ws傳送訊息，不用forEach迴圈
    //referenceList[receiveSide][receiveSid]
    //===============================================分隔線================================================
    //安全性問題，實務上要注意
    //side如果可以從req抓來源(哪個網頁傳的)，不應該從前端發side 直接抓網頁來源判斷哪方才可以確保安全性
    //===============================================分隔線================================================
    //建立列表 用WS 作為參數
    //map(ws) => { "sid": getSid, "name": getName, "side": side }
    const map = new Map();
    //對照表 找出WS 不用FOREACH referenceList[side][sid] => ws
    const referenceList = [0, {}, {}, {}, {}];
    //開啟監聽器--連線
    wsServer.on('connection', (ws, req) => {
        // console.log(req);
        //message = {side:0/1/2/3}
        //{"msg":訊息,"receive_sid":接收對象SID,"receive_side":接收方[,"post_side":發訊方][,"read",true已讀]}
        //用陣列的序列判斷是誰
        // const sideList = [0, "member", "store", "deliver", "admin"];
        console.log('-----WS連線數:' + wsServer.clients.size + '-----');
        console.log(moment(new Date())
            .tz("Asia/Taipei")
            .format("MM-DD HH:mm:ss"));
        console.log('--------------------');
        //訊息傳入
        ws.on('message', async message => {
            //字串轉換成物件
            const MSG = JSON.parse(message.toString());
            // console.log(MSG);
            if (MSG.token) {
                //第一次發訊 設定傳送是哪方
                const tokens =  jwt.verify(MSG.token , process.env.JWT_SECRET)
                if(!tokens){
                  ws.close(); 
                  return 
                }
                const getSid = tokens.sid;
                const getName = tokens.name;
                const side = tokens.side;
                //先刪掉舊的
                try {
                  referenceList[side][getSid].close()
                  console.log('踢掉舊的');
                } catch (error) {                  
                }        
                // console.log(tokens);
                console.log('----聊天室連線----');
                console.log('名稱:'+getName +',side:'+side+',sid:'+getSid);
                console.log('------------------');
                // console.log(referenceList[side][getSid]);
                map.set(ws, { "sid": getSid, "name": getName, "side": side });
                referenceList[side][getSid] = ws;
                // console.log(referenceList[4]);
              //1109 0905
            }
            else if(MSG.msg){
                //客服系統
                //{"msg":訊息,"receive_sid":接收對象SID,"receive_side":接收方,"post_side":3}
                const postSide = map.get(ws).side;
                const postSid = map.get(ws).sid;
                const content = MSG.msg;
                const receiveSid = MSG.receive_sid;
                const receiveSide = MSG.receive_side;
                //寫入資料庫
                const sql = "INSERT INTO `messages`(`post_sid`, `post_side`, `receive_sid`, `receive_side`, `post_content`, `post_time`) VALUES (?,?,?,?,?,NOW())"
                let [{ affectedRows,insertId }] = await DB.query(sql, [postSid, postSide, receiveSid, receiveSide, DB.escape(content)])
                // console.log();
                console.log('--------------------');

                console.log( "WS發言，儲存的資料庫列數:"+ affectedRows );
                console.log('資料庫SID:'+insertId);
                console.log("WS發言者:" + postSid + ",side:" + postSide);
                console.log("WS發言內容:" + content + ",WS發言對象:" + receiveSid + ",side:" + receiveSide);
                console.log('--------------------');
                //回傳現在時間
                const timeNow = moment(new Date())
                    .tz("Asia/Taipei")
                    .format("YYYY-MM-DD HH:mm:ss");
                //設定要回傳的資料
                let sendData = { "post_content": content, "name": map.get(ws).name, "post_side": postSide, "post_sid": postSid, "receive_side": receiveSide, "receive_sid": receiveSid,"sid":insertId, "post_time": timeNow /*[,"read",true已讀]*/ };
                //從對照表找對方WS
                const receiveWS = referenceList[receiveSide][receiveSid];
                // console.log(receiveWS);
                //如果對方在線上 才傳訊息 不然會噴錯誤
                if (receiveWS) {
                    receiveWS.send(JSON.stringify(sendData));
                }
                sendData.self = true
                //最後再傳回本人 再顯示在發訊者畫面上
                ws.send(JSON.stringify(sendData));
            }else if (MSG.orderMsg){
              //訂單中對話
              //{"orderMsg":訊息,"receive_sid":接收對象SID,"receive_side":接收方}
              const postSide = map.get(ws).side;
              const postSid = map.get(ws).sid;
            }
            else{
              ws.close();
            }
            return;
        });
        ws.on('close',()=>{
          console.log('----聊天室離線----');
          if(referenceList[map.get(ws)]){
            delete referenceList[map.get(ws).side][map.get(ws).sid];
          }
        })
    });
};
module.exports = createEchoServer;