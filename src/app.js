import express from 'express';
import mocksRouter from './routes/mocks.routes.js';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import productsRoutes from './routes/productsRoutes.js';
import cartsRoutes from './routes/cartsRoutes.js';
import viewsRoutes from './routes/views.routes.js';
import ProductManager from './dao/fileManagers/productManager.js';
import mongoose from 'mongoose'; 
import productsModel from './dao/model/products.models.js';
import handlebars from 'handlebars';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/session.routes.js'
import dotenv from 'dotenv';
import cluster from 'node:cluster'
import {cpus} from 'node:os'
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express'

dotenv.config();

const nucleos = cpus().length

// Cargar el archivo .env

const __dirname = path.resolve();
const app = express();

// Cargar las variables de entorno
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

const pManager = new ProductManager();

const httpServer = createServer(app);
const io = new SocketServer(httpServer);
const API_PREFIX = 'api';



// if(cluster.isPrimary){
//   console.log("Main process ID:",process.pid)
//   console.log("Main process, forking.")
//   for(let i = 0;i<nucleos;i++){
//     cluster.fork()
//   }
// }else{
  
   httpServer.listen(PORT, () => console.log(`Up N'running on port ${PORT}`)); 
//   console.log(process.pid)
// }


// Conexión a MongoDB usando la variable MONGO_URI del archivo .env
const connection = mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

 
  

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(cookieParser());
app.use('/api/mocks', mocksRouter);



// Handlebars engine setup
app.engine('handlebars', engine({
  handlebars,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));

app.set('views', path.join(__dirname, './src/views'));
app.set('view engine', 'handlebars');

// Routes
app.use(`/${API_PREFIX}/products`, (req, res, next) => {
  req.io = io; // Inject io/socket into req object
  next();
}, productsRoutes);
app.use(`/${API_PREFIX}/carts`, cartsRoutes);
app.use(`/auth`, userRoutes);


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce Api',
      version: '1.0.0',
      description: 'Documenting every route from proyect',
    },
    servers: [{ url: 'http://localhost:8080' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/session.routes.js','./src/routes/cartsRoutes.js','./src/routes/productsRoutes.js'], 
};


const specs = swaggerJSDoc(swaggerOptions);

app.use('/apidocs', swaggerUI.serve, swaggerUI.setup(specs));

if (!cluster.isPrimary) {
  app.use('/apidocs', swaggerUI.serve, swaggerUI.setup(specs));
}

app.use(`/`, viewsRoutes);

io.on('connection', async (socket) => {
  console.log('New client connected', socket.id);

  // Send the initial list of products to the new client
  const products = await productsModel.find();
  socket.emit('prod-logs', products);

  // Handle new product addition
  socket.on('new-prod', async (data) => {
    try {
      console.log('Received new-prod data:', data);
      await productsModel.insertMany(data);
      io.emit('prod-logs', await productsModel.find());
    } catch (error) {
      console.error('Error handling new-prod event:', error);
    }
  });

  // Handle product deletion
  socket.on('borrar-prod', async (productId) => {
    try {
      console.log('Received borrar-prod data:', productId);
      const deletedProduct = await productsModel.findByIdAndDelete(productId);
      if (deletedProduct) {
        io.emit('prod-logs', await productsModel.find());
      } else {
        console.error('Product not found for deletion');
      }
    } catch (error) {
      console.error('Error handling borrar-prod event:', error);
    }
  });

  // Handle product update
  socket.on('update-prod', async (updatedProduct) => {
    try {
      console.log('Received update-prod data:', updatedProduct);
      const result = await productsModel.findByIdAndUpdate(updatedProduct._id, updatedProduct, { new: true });
      if (result) {
        io.emit('prod-logs', await productsModel.find());
      } else {
        console.error('Product not found for update');
      }
    } catch (error) {
      console.error('Error handling update-prod event:', error);
    }
  });
});

app.get('/realtimeproducts', async (req, res) => {
  const products = await productsModel.find();
  res.render('realTimeProducts', { products });
});

export default httpServer;


