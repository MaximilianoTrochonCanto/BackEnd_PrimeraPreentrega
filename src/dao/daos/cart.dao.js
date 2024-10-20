import Cart from "../model/carts.models.js";

class CartDAO {
  async getCartById(cartId) {
    return await Cart.findById(cartId).populate("products.product");
  }

  async createCart(cartData) {
    return await Cart.create(cartData);
  }

  async updateCart(cartId, updateData) {
    return await Cart.findByIdAndUpdate(cartId, updateData, { new: true });
  }

  async deleteCart(cartId) {
    return await Cart.findByIdAndDelete(cartId);
  }
}

export default new CartDAO();
