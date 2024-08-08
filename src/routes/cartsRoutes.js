// routes/cartRoutes.js
import { Router } from 'express';
import cartsModel from '../dao/model/carts.models.js';
import productsModel from '../dao/model/products.models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const carts = await cartsModel.find().populate('products.product');
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
    const cart = await cartsModel.findById(req.params.cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    if(cart.products.length === 0)res.json("El carrito esta vacio")
    res.json(cart.products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});


router.post('/:cartId/product/:productId', async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const { cartNumber } = req.body; 
    
    const cart = await cartsModel.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const product = await productsModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: 'El producto no está disponible' });
    }

    const existingProduct = cart.products.find(p => p.product.toString() === productId);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    product.stock -= 1;

    if (product.stock === 0) {
      product.status = false; 
    }

    await product.save();

    if (cartNumber) {
      cart.number = cartNumber;
    }

    await cart.save();

    res.status(200).json({ message: 'Product added to cart and stock updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productInCart = cart.products.find(product => product.product.toString() === pid);

    if (!productInCart) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    const product = await productsModel.findById(pid);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    product.stock += productInCart.quantity;
    product.status = true;
    await product.save();

    cart.products = cart.products.filter(product => product.product.toString() !== pid);

    await cart.save();

    res.json({ message: 'Producto eliminado del carrito y stock actualizado' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});




router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await cartsModel.findOneAndUpdate(
      { id: cid },
      { products },
      { new: true, upsert: true }
    );

    res.json({
      status: 'success',
      message: 'Carrito actualizado correctamente',
      cart
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});


router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad debe ser mayor que cero'
      });
    }

    const cart = await cartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const productInCart = cart.products.find(product => product.product.toString() === pid);

    if (!productInCart) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    const product = await productsModel.findById(pid);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const stockChange = productInCart.quantity - quantity;

    if (product.stock + stockChange < 0) {
      return res.status(400).json({ message: 'No hay suficiente stock disponible' });
    }

    product.stock += stockChange;
    product.status = product.stock > 0; 
    await product.save();

    productInCart.quantity = quantity;

    await cart.save();

    res.json({
      status: 'success',
      message: 'Cantidad del producto actualizada correctamente y stock modificado',
      cart
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartsModel.findOne({ _id: cid });

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    for (const cartProduct of cart.products) {
      const product = await productsModel.findById(cartProduct.product);
      if (product) {
        product.stock += cartProduct.quantity; 
        if (!product.status && product.stock > 0) {
          product.status = true; 
         }
        await product.save();
      }
    }

    cart.products = [];
    await cart.save();

    res.json({ message: 'Todos los productos fueron eliminados del carrito y las cantidades devueltas al stock' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Hubo un error al procesar la solicitud',
    });
  }
});


export default router;
