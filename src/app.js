import express from 'express';
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

const __dirname = path.resolve();
const app = express();
const PORT = 8080;
const mongoHOST = "localhost";
const mongoPORT = 27017;
const mongoDB = "ecommerce";
const pManager = new ProductManager();

const httpServer = createServer(app);
const io = new SocketServer(httpServer);
const API_PREFIX = 'api';

httpServer.listen(PORT, () => console.log(`Up N'running ${PORT}`));

const connection = mongoose
  .connect(
    `mongodb+srv://MaxiTrochon:Solynico81**@cluster0.cdecepf.mongodb.net/ecommerce`
  )
  .then((con) => {
    console.log("Connected to mongo");
  })
  .catch((err) => {
    console.log(err);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

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
app.use(`/`, viewsRoutes);

io.on('connection', async (socket) => {
  console.log('New client connected', socket.id);

  //file manager -> const products = await pManager.getProducts();
  const products = await productsModel.find();
  socket.emit('prod-logs', products);

  socket.on('new-prod', async (data) => {
    await productsModel.insertMany(data);
    io.emit('prod-logs', await productsModel.find());
  });

  socket.on('borrar-prod', async (data) => {
    await productsModel.deleteOne({ _id: data });
    io.emit('prod-logs', await productsModel.find());
  });

  socket.on('update-prod', async (data) => {
    await productsModel.findByIdAndUpdate(data.id, data, { new: true });
    io.emit('prod-logs', await productsModel.find());
  });
});

app.get('/real-time-products', async (req, res) => {
  const products = await productsModel.find();
  res.render('realTimeProducts', { products });
});

export default io;

