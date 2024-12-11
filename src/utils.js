import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

// const _filename = fileURLToPath(import.meta.url)

const storage = multer.diskStorage({
    destination:(req,file,callback) => {
        callback(null,__dirname + '/public/img')
    },
    filename:(req,file,cb) => {
        cb(null,file.filename)
    }
})

export const uploader = multer({storage})