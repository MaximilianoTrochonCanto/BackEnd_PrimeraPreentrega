import ProductDAO from "../dao/daos/product.dao.js";

class ProductRepository {
  async getProductById(productId) {
    const product = await ProductDAO.getProductById(productId);
    if (!product) throw new Error("Product not found");
    return product;
  }

  async createProduct(productData) {
    return await ProductDAO.createProduct(productData);
  }

  async updateProduct(productId, updateData) {
    return await ProductDAO.updateProduct(productId, updateData);
  }

  async deleteProduct(productId) {
    return await ProductDAO.deleteProduct(productId);
  }

  async updateStock(productId, quantity) {
    const product = await ProductDAO.getProductById(productId);
    if (!product) throw new Error("Product not found");

    if (product.stock < quantity) throw new Error("Insufficient stock");
    
    return await ProductDAO.updateStock(productId, quantity);
  }
}

export default new ProductRepository();
