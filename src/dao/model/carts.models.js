import mongoose from "mongoose"

const collectionName = "Carts"

const cartSchema = mongoose.Schema({
    
    number:{
        type:Number,
        required:true,
        unique:true
    },
    
    products: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
          quantity: { type: Number, required: true }
        }
      ]
    
})



const cartsModel = mongoose.model(collectionName, cartSchema)

export default cartsModel