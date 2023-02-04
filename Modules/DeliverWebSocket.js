const WebSocket = require('ws');
const DB = require('../Modules/ConnectDataBase');
const moment = require("moment-timezone");
const jwt = require('jsonwebtoken')
const OrderWebSocket = (server) => {
    const wsServer = new WebSocket.Server({ server });
    //建立列表 用WS 作為參數
    //map(ws) => { "sid": getSid, "name": getName, "side": side }
    const map = new Map();
    //對照表 找出WS 不用FOREACH referenceList[side][sid] => ws
    const referenceList = [0, {}, {}, {}];
    //開啟監聽器--連線
    wsServer.on('connection', (ws, req) => {
        // console.log(req);
        //message = {side:0/1/2/3}
        //用陣列的序列判斷是誰
        // const sideList = [0, "member", "store", "deliver", "admin"];
        console.log('-----訂單伺服器連線數:' + wsServer.clients.size + '-----');
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
                // console.log(tokens);
                const getSid = tokens.sid;
                const getName = tokens.name;
                const side = tokens.side;
                console.log('----訂單伺服器連線----');
                console.log('名稱:'+getName +',side:'+side+',sid:'+getSid);
                console.log('------------------');
                map.set(ws, { "sid": getSid, "name": getName, "side": side });
                referenceList[side][getSid] = ws;
            }
            //MSG = {postSid :1 , postSide : 1 ,receiveSide :2 ,receiveSid :89,step : 1}    會員送到店家
            //MSG = {postSid :89 , postSide : 2 ,receiveSide :1 ,receiveSid :1,step : 2}    店家送到會員
            //MSG = {postSid :89 , postSide : 2 ,receiveSide :1 ,receiveSid :1,step : 3}    店家送到會員
            //MSG = {postSid :1 , postSide : 3 ,receiveSide :1 ,receiveSid :1,step : 4 , receiveStoreSid:89}  外送員送到店家跟會員
            else if(MSG.step){
                console.log(MSG);
                //不是第一次發言
                // //{"msg":訊息,"receive_sid":接收對象SID,"receive_side":接收方,"post_side":3}
                // const postSide = map.get(ws).side;
                // const postSid = map.get(ws).sid;
                // const content = MSG.msg;
                const receiveSid = MSG.receiveSid;
                const receiveSide = MSG.receiveSide;

                const sendMSG = MSG

                //從對照表找對方WS
                const receiveWS = referenceList[receiveSide][receiveSid];
                //如果對方在線上 才傳訊息 不然會噴錯誤
                if (receiveWS) {
                    receiveWS.send(JSON.stringify(sendMSG));
                }
            }
            else{
              ws.close();
            }
            return;
        });
        ws.on('close',()=>{
          console.log('----聊天室離線----');
          console.log('sid:'+map.get(ws).sid);
          console.log('side:'+map.get(ws).side);
          delete referenceList[map.get(ws).side][map.get(ws).sid];
        })
    });
};
module.exports = OrderWebSocket;