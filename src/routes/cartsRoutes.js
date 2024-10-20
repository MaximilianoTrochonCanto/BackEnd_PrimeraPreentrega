// routes/cartRoutes.js
import { Router } from 'express';
import cartsModel from '../dao/model/carts.models.js';
import productsModel from '../dao/model/products.models.js';
import CartRepository from "../repositories/cart.repository.js";
import ProductRepository from "../repositories/product.repository.js";
import TicketRepository from "../repositories/ticket.repository.js";  // Repositorio de tickets
import { authenticateJWT, userOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/:cartId/product/:productId', authenticateJWT, userOnly, async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const { cartNumber } = req.body;

    const cart = await cartsModel.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const product = await productsModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Buscamos si el producto ya existe en el carrito
    const existingProduct = cart.products.find(p => p.product.toString() === productId);

    // Si ya está en el carrito, aumentar la cantidad
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      // Si no está, lo agregamos con cantidad 1
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    res.status(200).json({ message: 'Producto agregado al carrito.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno en el servidor' });
  }
});


router.post("/:cid/purchase", authenticateJWT, userOnly, async (req, res) => {
  try {
    const cart = await CartRepository.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado." });
    }

    const unavailableProducts = [];
    let totalAmount = 0;

    // Iterar sobre los productos del carrito
    for (const item of cart.products) {
      const product = await ProductRepository.getProductById(item.product._id);

      // Caso 1: Suficiente Stock (product.stock >= item.quantity)
      if (product.stock >= item.quantity) {
        // Restar la cantidad solicitada del stock y sumar el monto al total
        await ProductRepository.updateStock(product._id, item.quantity);
        totalAmount += product.price * item.quantity;

      // Caso 2: Stock Parcial (product.stock > 0 && product.stock < item.quantity)
      } else if (product.stock > 0) {
        // Procesar solo la cantidad disponible y sumar el total parcial
        totalAmount += product.price * product.stock;  // Sumar solo la cantidad disponible al total
        await ProductRepository.updateStock(product._id, product.stock);  // Restar el stock disponible

        // Agregar la diferencia a unavailableProducts (cantidad que no pudo procesarse)
        unavailableProducts.push({
          product: product._id,
          unavailableQuantity: item.quantity - product.stock,  // Diferencia no procesada
        });

        // Actualizar la cantidad restante del producto en el carrito
        item.quantity = item.quantity - product.stock;  // Mantener la cantidad no comprada en el carrito

      // Caso 3: Sin Stock (product.stock === 0)
      } else {
        // Agregar el producto completo a unavailableProducts ya que no hay stock
        unavailableProducts.push({
          product: product._id,
          unavailableQuantity: item.quantity,  // Cantidad completa no disponible
        });
      }
    }

    // Si se ha procesado al menos un producto, generar un ticket
    if (totalAmount > 0) {
      const ticketData = {
        amount: totalAmount,
        purchaser: req.user.email,  // Suponemos que `req.user.email` tiene el correo del comprador
      };
      const newTicket = await TicketRepository.createTicket(ticketData);  // Crear ticket
    }

    // Filtrar los productos no comprados (los que tienen cantidades > 0 después del proceso)
    cart.products = cart.products.filter(item => item.quantity > 0);

    // Actualizar el carrito con los productos que no se compraron completamente
    await CartRepository.updateCart(req.params.cid, { products: cart.products });

    // Construir el mensaje de respuesta
    let message = "Compra completa";
    if (unavailableProducts.length > 0 && totalAmount > 0) {
      message = "Hay productos sin stock, pero la compra fue procesada parcialmente";
    } else if (unavailableProducts.length > 0) {
      message = "Hay productos sin stock";
    }

    // Enviar la respuesta con los productos no procesados (si existen)
    res.json({
      message,
      unavailableProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});








// router.post("/:cid/purchase", authenticateJWT, userOnly, async (req, res) => {
//   try {
//     const cart = await CartRepository.getCartById(req.params.cid);
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     const unavailableProducts = [];
//     let totalAmount = 0;

//     // Iterar sobre los productos del carrito
//     for (const item of cart.products) {
//       const product = await ProductRepository.getProductById(item.product._id);

//       // Si el producto tiene stock suficiente
//      if (product.stock >= 0) {
//         // Si hay stock parcial, restar solo lo disponible y agregar el resto a unavailableProducts
//         totalAmount += product.price * item.quantity;  // Sumar solo la cantidad disponible al total
//         await ProductRepository.updateStock(product._id, product.stock);  // Restar el stock disponible

        

//       } else {
//         // Si no hay stock disponible, agregar todo el producto a unavailableProducts
//         unavailableProducts.push({
//           product: product._id,
//           unavailableQuantity: item.quantity,  // Cantidad completa no disponible
//         });
//       }
//     }

//     // Si se ha procesado al menos un producto, generar un ticket
//     if (totalAmount > 0) {
//       const ticketData = {
//         amount: totalAmount,
//         purchaser: req.user.email,  // Asumimos que `req.user.email` tiene el correo del usuario
//       };
//       const newTicket = await TicketRepository.createTicket(ticketData);  // Crear ticket
//     }

//     // Filtrar los productos que no pudieron comprarse para actualizar el carrito
//     cart.products = cart.products.filter(item => 
//       unavailableProducts.some(unavailable => unavailable.product === item.product._id)
//     );

//     // Actualizar el carrito con los productos no comprados
//     await CartRepository.updateCart(req.params.cid, { products: cart.products });

//     // Enviar la respuesta con los productos no procesados (si existen)
//     res.json({
//       message: unavailableProducts.length > 0 
//         ? "Hay productos sin stock"
//         : "Compra completa",
//       unavailableProducts
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


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
