import Product from "../model/products.models.js";

class ProductDAO {
  async getProductById(productId) {
    return await Product.findById(productId);
  }

  async createProduct(productData) {
    return await Product.create(productData);
  }

  async updateProduct(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true });
  }

  async deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId);
  }

  async updateStock(productId, quantity) {
    return await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
  }
}

export default new ProductDAO();
