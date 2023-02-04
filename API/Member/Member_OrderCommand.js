const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

router.post("/store", async (req, res) => {
  const output = {}
  const postData = req.body
  const { command, stars, orderSid, targetSid } = postData
  const memberSid = req.token.sid
  // console.log(postData);

  const sql = "INSERT INTO `shop_evaluation`(`order_sid`, `member_sid`, `shop_sid`, `evaluation_score`, `evaluation_content`, `evaluation_time`) VALUES (?,?,?,?,?,NOW())"
  const [result] = await DB.query(sql,[orderSid,memberSid,targetSid,stars,command])
  output.result = result
  const avgSql = "SELECT AVG(`evaluation_score`) avg FROM `shop_evaluation` WHERE `shop_sid` = ?"
  const [[{avg}]] = await DB.query(avgSql,targetSid)
  console.log(avg);
  const newAvg =parseInt(avg * 10) / 10
  console.log(newAvg);
  output.newAvg = newAvg
  const deliverStarSql = "UPDATE `shop` SET `average_evaluation`='?' WHERE `sid`=?"
  const [deliverStarResult] = await DB.query(deliverStarSql,[newAvg,targetSid])
  output.deliverStarResult = deliverStarResult
  res.json(output)
})
router.post("/deliver", async (req, res) => {
  const output = {}
  const postData = req.body //{ command: '', stars: 1, orderSid: 112, targetSid: 1 }
  const { command, stars, orderSid, targetSid } = postData
  const memberSid = req.token.sid
  // console.log(postData);
  const sql ="INSERT INTO `deliver_evaluation`(`order_sid`, `member_sid`, `deliver_sid`, `evaluation_score`, `evaluation_content`, `evaluation_time`) VALUES (?,?,?,?,?,NOW())" 
  const [result] = await DB.query(sql,[orderSid,memberSid,targetSid,stars,command])
  output.result = result
  const avgSql = "SELECT AVG(`evaluation_score`) avg FROM `deliver_evaluation` WHERE `deliver_sid` = ?"
  const [[{avg}]] = await DB.query(avgSql,targetSid)
  console.log(avg);
  const newAvg =parseInt(avg * 10) / 10
  console.log(newAvg);
  output.newAvg = newAvg
  const deliverStarSql = "UPDATE `deliver` SET `average_evaluation`='?' WHERE `sid`=?"
  const [deliverStarResult] = await DB.query(deliverStarSql,[newAvg,targetSid])
  output.deliverStarResult = deliverStarResult
  res.json(output)
})

module.exports = router;