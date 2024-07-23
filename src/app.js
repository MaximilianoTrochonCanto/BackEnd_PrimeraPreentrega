import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import handlebars from 'express-handlebars';
import path from 'path';
import productsRoutes from './routes/productsRoutes.js';
import cartsRoutes from './routes/cartsRoutes.js';
import viewsRoutes from './routes/views.routes.js';
import ProductManager from './dao/fileManagers/productManager.js';

const __dirname = path.resolve();
const app = express();
const PORT = 8080;

const pManager = new ProductManager();

const httpServer = createServer(app);
const io = new SocketServer(httpServer);
const API_PREFIX = 'api';

httpServer.listen(PORT, () => console.log(`Up N'running ${PORT}`));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Handlebars engine setup
app.engine('handlebars', handlebars.engine());
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

    // Emit initial products to connected client
    const products = await pManager.getProducts();
    socket.emit('prod-logs', products);

    // Handle new product creation
    socket.on('new-prod', async (data) => {
        await pManager.createProduct(data);
        io.emit('prod-logs', await pManager.getProducts());
    });

    // Handle product deletion
    socket.on('borrar-prod', async (data) => {
        await pManager.deleteProduct(data);
        io.emit('prod-logs', await pManager.getProducts());
    });

    // Handle product update
    socket.on('update-prod', async (data) => {
        await pManager.updateProduct(data.id, data);
        io.emit('prod-logs', await pManager.getProducts());
    });
});

// Route to render real-time products view
app.get('/real-time-products', async (req, res) => {
    const products = await pManager.getProducts();
    res.render('realTimeProducts', { products });
});

export default io;

