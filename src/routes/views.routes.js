import { Router} from 'express';
import ProductManager from '../dao/fileManagers/productManager.js';
import CartManager from '../dao/fileManagers/cartManager.js'; // Assuming you have a CartManager class
import path from 'path';


const router = Router();
const productManager = new ProductManager();


// Initialize your managers with appropriate file paths
const cartManager = new CartManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
       
        
        res.render("home", { products });
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCart(req.params.cid);
        const cartProducts = await cartManager.getCartProducts(req.params.cid);
        res.render('productsCart', { cart, products: cartProducts });
    } catch (error) {
        console.error(`Error retrieving cart with ID ${req.params.cid}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/products', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('products', { products });
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts");
  });
  

export default router;
