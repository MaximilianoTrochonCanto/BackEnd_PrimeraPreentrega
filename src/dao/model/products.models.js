import mongoose from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2'

const collectionName = "Products"

const productSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
    },
    code:{
        type:String,
        required:true,
        unique:true,
    },
    status:{
        type:Boolean,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    thumbnails:{
        type:Array,        
    }    
    
})
productSchema.plugin(mongoosePaginate)
const productsModel = mongoose.model(collectionName, productSchema)

export default productsModel