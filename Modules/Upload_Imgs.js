//圖片上傳模組
const multer = require("multer");
const {v4:uuidv4} = require("uuid");

//過濾檔案
const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp'
};


//檔案格式過濾 
const fileFilter = (req,file,callback)=>{
    //            比對檔案種類，如果沒有則回傳FALSE
    callback(null,!!extMap[file.mimetype])
}
//儲存檔案位置、名稱
const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        //儲存位置
        callback(null, __dirname + '/../uploads')
    },
    filename:(req,file,callback)=>{
        const ext = extMap[file.mimetype];
        //儲存檔名  隨機檔名 + EXT(副檔名)
        callback(null,uuidv4()+ ext );
    }

})


module.exports = multer({storage,fileFilter});