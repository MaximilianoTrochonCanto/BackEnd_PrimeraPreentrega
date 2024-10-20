import { Router} from 'express';
import ProductManager from '../dao/fileManagers/productManager.js';
import CartManager from '../dao/fileManagers/cartManager.js'; // Assuming you have a CartManager class
import path from 'path';
import productsModel from '../dao/model/products.models.js';
import cartsModel from '../dao/model/carts.models.js';

const router = Router();


router.get('/', async (req, res) => {
    try {
        const products = await productsModel.find();
        const carts = await cartsModel.find()
        
        res.render("home", { products,carts });
    } catch (error) {
        console.error('Ha ocurrido un error.', error);
        res.status(500).json({ error: 'Ha ocurrido un error de servidor.' });
    }
});

router.get("/carts/:cid", async (req, res) => {
    try {
      const cart = await cartsModel.findOne({ _id: req.params.cid }).lean();
      const populatedProducts = await Promise.all(
        cart.products.map(async (item) => {
          const product = await productsModel.findById(item.product).lean();
          return { ...item, product };
        })
      );
  
      cart.products = populatedProducts;
      console.log(cart.products); 
      res.render("productsCart", { cart });
    } catch (error) {
      console.error('Error al extraer productos del carrito:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

router.get('/products', async (req, res) => {
    try {
        const products = await productsModel.find();
        res.render('products', { products });
    } catch (error) {
        console.error('Error al extraer productos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts");
  });
  

export default router;
