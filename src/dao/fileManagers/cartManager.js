import fs from 'fs/promises';
import path from 'path';
import ProductManager from './productManager.js';
const _dirname = path.resolve();

class CartManager {
  constructor() {
    this.filePath = path.join(_dirname, "src","dao",'fileManagers', 'carts.json');
    this.productManager = new ProductManager();
  }

  async addProduct(cid, pid) {
    try {
      const cart = await this.getCart(cid);
      const product = await this.productManager.getProductById(pid);

      if (!product.status) {
        throw new Error('El producto no tiene stock');
      }

      const existingProduct = cart.products.find(p => p.product === pid);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      await this.updateCart(cart);

      return `Producto con ID ${pid} agregado al carrito con ID ${cid}`;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCart(cid) {
    try {
      const carts = await this.readCartsFromFile();
      const cart = carts.find(c => c.id === cid);

      if (!cart) {
        throw new Error(`El carrito con ID ${cid} no fue encontrado`);
      }

      return cart;
    } catch (error) {
      throw new Error(error);
    }
  }

  async readCartsFromFile() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data).carts;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  async updateCart(cart) {
    try {
      const carts = await this.readCartsFromFile();
      const index = carts.findIndex(c => c.id === cart.id);

      if (index !== -1) {
        carts[index] = cart;
        await this.writeCartsToFile(carts);
      } else {
        throw new Error(`El carrito con ID ${cart.id} no fue encontrado`);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  async writeCartsToFile(carts) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify({ carts }, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }
}

export default CartManager;
