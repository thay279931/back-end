const express = require('express')
const router = express.Router()
const DB = require('../../Modules/ConnectDataBase')
const moment = require("moment-timezone");
const line_pay = require('line-pay')
const cache = require('memory-cache')

// 因為沒有連到資料庫 所以都是用CACHE暫存

const pay = new line_pay({
  channelId: process.env.LINE_PAY_CHANNEL_ID,
  channelSecret: process.env.LINE_PAY_CHANNEL_SECRET,
  isSandbox: true,
})
router.get('/reserve', (req, res) => {
  console.log(req.query); 
  const datas = req.query
  //{ productName: '隨饗', amount: '1000', currency: 'TWD', orderId: '73' }
  //正式環境這裡應該只傳訂單編號 然後到資料庫抓資料傳送
  const siteName = datas.siteName
  let options = {
    amount: datas.amount,
    productName: '隨饗',
    currency: 'TWD',
    orderId: datas.orderId,
    confirmUrl: `http://${siteName}:3000/PayConfirmed`,
  }
  /*
  {
    "amount" : 2000,
    "productName":"隨饗",
    "currency" : "TWD",
    "orderId" : "MKSI_S_20180904_1000001",
    "packages" : [
        {
            "id" : "1",
            "amount": 2000,
            "products" : [
                {
                    "id" : "PEN-B-001",
                    "name" : "義大利麵ˇ",
                    "quantity" : 4,
                    "price" : 500
                }
            ]
        }
    ],
    "redirectUrls" : {
        "confirmUrl" : "https://pay-store.line.com/order/payment/authorize",
        "cancelUrl" : "https://pay-store.line.com/order/payment/cancel"
    }
  }*/

  // record order status value to 'pending'
  //  更改訂單進度  等待中 之後存到資料庫
  cache.put(req.query.orderId, 'pending')
  //這段是發REQ  PROMISE
  pay.reserve(options).then((response) => {
    let reservation = options
    reservation.transactionId = response.info.transactionId
    console.log('response')
    console.log(response)
    /*{
  returnCode: '0000',
  returnMessage: 'Success.',
  info: {
    paymentUrl: {
      web: 'https://sandbox-web-pay.line.me/web/payment/wait?transactionReserveId=MDNaRlk1aTJLeHJvc28rSThGOVp2TTJuMU1JSElrSkppV1ZRRjFBK3dpOVB6alZrclU3dVdKQ2QzdnF5cG5HVA',
      app: 'line://pay/payment/MDNaRlk1aTJLeHJvc28rSThGOVp2TTJuMU1JSElrSkppV1ZRRjFBK3dpOVB6alZrclU3dVdKQ2QzdnF5cG5HVA'
    },
    transactionId: '2022111300732049310',
    paymentAccessToken: '970526677038'
  }
  }*/

    console.log(`Reservation was made. Detail is following.`)
    console.log(reservation)
    /*{
  productName: '測試商品1',
  amount: '1',
  currency: 'TWD',
  orderId: 'SS20221112A1105',
  confirmUrl: 'http://localhost:3000/pay-confirm',
  transactionId: '2022111300732029110'
  }*/

    console.log('L92-', reservation.transactionId)
    //L92- 2022111300732029110

    // Save order information
    cache.put(reservation.transactionId, reservation)
    //前端導向到結帳頁
    res.redirect(response.info.paymentUrl.web)
  })
})

//檢查訂單狀態 先不放
// Router configuration to start payment.
// router.get('/checking', (req, res) => {
//   // record order status value to 'pending'
//   const status = cache.get(req.query.orderId)

//   if (!status) {
//     res.json({ status: 'not exist' })
//   }

//   res.json({ status })
// })

// Router configuration to receive notification when user approves payment.
router.get('/confirm',  async (req, res) => {
  if (!req.query.transactionId) {
    throw new Error('Transaction Id not found.')
  }

  // Retrieve the reservation from database.
  console.log('L108-', req.query.transactionId)

  /*    交易編號
  L108- 2022111300732029110
  */

  let reservation = cache.get(req.query.transactionId)

  console.log('L112-', reservation)
  /*
  L112- {
  productName: '測試商品1',
  amount: '1',
  currency: 'TWD',
  orderId: 'SS20221112A1105',
  confirmUrl: 'http://localhost:3000/pay-confirm',
  transactionId: '2022111300732029110'
  }*/

  if (!reservation) {
    throw new Error('Reservation not found.')
  }

  console.log(`Retrieved following reservation.`)
  console.log('L119-', reservation)
  // L119- {
  //   productName: '測試商品1',
  //   amount: '1',
  //   currency: 'TWD',
  //   orderId: 'SS20221112A1105',
  //   confirmUrl: 'http://localhost:3000/pay-confirm',
  //   transactionId: '2022111300732029110'
  // }

  let confirmation = {
    transactionId: req.query.transactionId,
    amount: reservation.amount,
    currency: reservation.currency,
  }

  console.log(`Going to confirm payment with following options.`)
  console.log(confirmation)

  pay.confirm(confirmation).then(async (response) => {
    console.log('line pay confirmatin completely')
    //res.send('決済が完了しました。')
    console.log('response193lane')
    console.log(response)
    /*{
  returnCode: '0000',
  returnMessage: 'Success.',
  info: {
    transactionId: '2022111300732049510',
    orderId: '1668334902265',
    payInfo: [ [Object] ]
  }
  }*/

    // change order status value to 'paid'
    //這邊之後變成寫資料庫
    cache.put(reservation.orderId, 'paid')

  //資料庫更新

    const paidSql = "UPDATE `orders` SET `LinePayID` =? ,`paid` =1 WHERE `sid` =?"

    const [result] = await DB.query(paidSql,[reservation.transactionId,reservation.orderId])



  console.log(result);





    res.json({ message: 'success' })
  })
})

module.exports = router
