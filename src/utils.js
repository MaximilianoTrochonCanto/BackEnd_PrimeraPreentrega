import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const _filename = fileURLToPath(import.meta.url)

export const _dirname = dirname(_filename)

const storage = multer.diskStorage({
    destination:(req,file,callback) => {
        callback(null,_dirname + '/public/img')
    },
    filename:(req,file,cb) => {
        cb(null,file.filename)
    }
})

export const uploader = multer({storage})