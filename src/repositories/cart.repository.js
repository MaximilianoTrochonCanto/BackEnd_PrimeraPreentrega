import CartDAO from "../dao/daos/cart.dao.js";

class CartRepository {
  async getCartById(cartId) {
    const cart = await CartDAO.getCartById(cartId);
    if (!cart) throw new Error("Cart not found");
    return cart;
  }

  async createCart(cartData) {
    return await CartDAO.createCart(cartData);
  }

  async updateCart(cartId, updateData) {
    return await CartDAO.updateCart(cartId, updateData);
  }

  async deleteCart(cartId) {
    return await CartDAO.deleteCart(cartId);
  }
}

export default new CartRepository();
