import { Router } from 'express';
import CartManager from '../dao/fileManagers/cartManager.js';

const router = Router();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
  try {
    const carts = await cartManager.readCartsFromFile();
    res.json({ carts });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCart(req.params.cid);
    res.json(cart.products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const message = await cartManager.addProduct(cid, pid);
    res.json({ message });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});

router.post('/', async (req, res) => {
  // Implement your POST logic here as needed, using cartManager methods
});

export default router;
