import { Router } from 'express';
import { uploader } from '../utils.js';
import productsModel from '../dao/model/products.models.js';
import ProductRepository from "../repositories/product.repository.js";
import { adminOnly, userOnly,authenticateJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'asc' } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage <= 0 || isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Pagina y limite deben ser positivos'
      });
    }

    const totalDocuments = await productsModel.countDocuments();
    const totalPages = Math.ceil(totalDocuments / parsedLimit);
    const skip = (parsedPage - 1) * parsedLimit;


    const sortOrder = sort === 'desc' ? -1 : 1;
    const products = await productsModel.find()
      .sort({ price: sortOrder })
      .skip(skip)
      .limit(parsedLimit);

    const hasPrevPage = parsedPage > 1;
    const hasNextPage = parsedPage < totalPages;

    const prevLink = hasPrevPage ? `/products?page=${parsedPage - 1}&limit=${parsedLimit}&sort=${sort}` : null;
    const nextLink = hasNextPage ? `/products?page=${parsedPage + 1}&limit=${parsedLimit}&sort=${sort}` : null;

    res.status(200).json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? parsedPage - 1 : null,
      nextPage: hasNextPage ? parsedPage + 1 : null,
      page: parsedPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    console.error('Error leyendo productos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await ProductRepository.getProductById(req.params.pid);
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post('/',authenticateJWT,adminOnly, uploader.single('thumbnail'), async (req, res) => {
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

    const newProduct = new productsModel({ title, description, price: parsedPrice, thumbnail, stock: parsedStock, status: true,code, category });
    await ProductRepository.createProduct(newProduct);

    req.io.emit('new-prod', newProduct);

    res.status(201).json({
      ...newProduct.toObject(),
      message: 'Producto agregado',
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/:pId',authenticateJWT,adminOnly, async (req, res) => {
  try {
    const { title, description, price, thumbnail, stock, code, category } = req.body;
    const productId = req.params.pId;

    const existingProduct = await productsModel.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = {
      title,
      description,
      price,
      thumbnail,
      stock,
      code,
      category,
    };

    const result = await productsModel.findByIdAndUpdate(productId, updatedProduct, { new: true });

    req.io.emit('update-prod', result);

    res.status(200).json({
      message: 'Producto actualizado correctamente.',
      product: result,
    });

  } catch (error) {
    console.error('Error al actualizar informacion:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:pId',authenticateJWT,adminOnly, async (req, res) => {
  try {
    const productId = req.params.pId;

    const existingProduct = await productsModel.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await productsModel.findByIdAndDelete(productId);

    req.io.emit('borrar-prod', productId);

    res.status(200).json({
      message: 'Producto borrado.',
      deletedProduct: existingProduct,
    });

  } catch (error) {
    console.error('Error al borrar producto:', error);
    res.status(400).json({ message: error.message });
  }
});



export default router;

