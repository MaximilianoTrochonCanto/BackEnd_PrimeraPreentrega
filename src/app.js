const Server = require('socket.io')
const express = require("express")
const productsRoutes = require("./routes/productsRoutes")
const cartsRoutes = require("./routes/cartsRoutes")
const viewsRoutes = require("./routes/views.routes")
const handlebars = require("express-handlebars")
const path = require("path")
const app = express()
const PORT = 8080
const mongoHOST = "localhost"
const mongoPORT = 27017
const mongoDB = "ecommerce"
const fs = require("fs/promises")
const mongoose = require("mongoose")
const ProductManager = require("./dao/fileManagers/productManager")
const messagesModel = require('./dao/model/messages.models')
const productsModel = require('./model/products.models')
const { Console } = require('console')

const pManager = new ProductManager(path.join(__dirname, "./products.json"))

const httpServer = app.listen(PORT,()=>console.log(`Up N'running ${PORT}`))

const io = new Server.Server(httpServer)
const API_PREFIX = "api"



app.get("/",async(req,res)=>{
    const products = await productsModel.find()
    console.log(products)
    res.render("home",{ products })
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))
console.log()
app.use(express.static(__dirname+"/public"))
app.engine("handlebars",handlebars.engine())
app.set("views",path.join(__dirname,"/views"))
app.set("view engine","handlebars")


app.use(`/${API_PREFIX}/products`,productsRoutes)
app.use(`/${API_PREFIX}/carts`,cartsRoutes)
app.use(`/`,viewsRoutes)

const connection = mongoose.connect(
    `mongodb+srv://MaxiTrochon:Solynico81**@cluster0.cdecepf.mongodb.net/ecommerce
`
).then((con) => {
    console.log("Connected to mongo")
}).catch((err) => {
    console.log(err)
})


io.on("connection", async(socket) => {
     let prods = await productsModel.find()
//    socket.emit("prod-logs",{prods})
    console.log("New client connected", socket.id)
    socket.on("new-prod",async(data) =>{   
       
        const lastId = prods[prods.length - 1].id
        await pManager.createProduct({
            id:(Number(lastId)+ 1).toString(),
            status:true,
            ...data
          })  
          await productsModel.insertMany(data)

      
    //   pr.push(p)
      io.emit("prod-logs",await productsModel.find())
      // PORQUE NO ME DEJA SEGUIR AGREGANDO Y SOBREESCRIBE???  
      
          
      
      
    })


    socket.on("newMessage",async(data) => {
        if(data !== undefined)
        await messagesModel.insertMany(data)        
        io.emit("msg",await messagesModel.find())
    })

    socket.on("borrar-prod",async(data) => {    
       await productsModel.deleteOne({_id:data})
       
        io.emit("prod-logs",await productsModel.find())
        
    })

})


module.exports = io;