import { Router } from 'express';
import { uploader } from '../utils.js';
import ProductManager from '../dao/fileManagers/productManager.js';

const router = Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    let limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit <= 0) {
      limit = products.length;
    }
    res.status(200).json(products.slice(0, limit));
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:pId', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', uploader.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, price, thumbnail, stock, code, category } = req.body;
    if (!title || !description || !price || !stock || !code) {
      return res.status(400).json({
        message: "Los campos 'titulo', 'descripcion', 'precio', 'stock' y 'codigo' son obligatorios.",
      });
    }
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);
    if (isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedStock) || parsedStock <= 0) {
      return res.status(400).json({
        message: "Los campos 'precio' y 'stock' deben ser números mayores que cero.",
      });
    }

    const newProduct = { title, description, price: parsedPrice, thumbnail, stock: parsedStock, code, category };
    console.log(newProduct);
    await productManager.createProduct(newProduct);

    // Emit to WebSocket clients
    req.io.emit('new-prod', newProduct);

    res.status(201).json({
      ...newProduct,
      message: 'Producto agregado',
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:pId', async (req, res) => {
  try {
    const { title, description, price, thumbnail, stock, code, category } = req.body;
    const productId = req.params.pId;

    const existingProduct = await productManager.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = {
      id: productId,
      title,
      description,
      price,
      thumbnail,
      stock,
      code,
      category,
    };

    await productManager.updateProduct(productId, updatedProduct);

    // Emit to WebSocket clients
    req.io.emit('update-prod', updatedProduct);

    res.status(200).json({
      message: 'Producto actualizado correctamente.',
      product: updatedProduct,
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:pId', async (req, res) => {
  try {
    const productId = req.params.pId;

    const existingProduct = await productManager.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const deletedProduct = await productManager.deleteProduct(productId);

    // Emit to WebSocket clients
    req.io.emit('borrar-prod', productId);

    res.status(200).json({
      message: 'Producto borrado.',
      deletedProduct,
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
