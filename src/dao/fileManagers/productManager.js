import fs from "fs/promises"
import path from 'path';
const __dirname = path.resolve();

class ProductManager{
    constructor(){
        this.pathDB = path.join(__dirname,'src','dao', 'fileManagers', 'products.json');
    }

    


    async createProduct(product){        
        const {titulo,descripcion,precio,thumbnail,stock,codigo} = product;
        const allProducts = await this.getProducts();        
        
        
        
        const lastId =
        allProducts.length === 0
          ? Number(1)
          : Number(
              allProducts[allProducts.length - 1].id
            ) + 1;
        const newProduct = { id: lastId.toString(),status:true, ...product };


        allProducts.push(newProduct);
        await fs.writeFile(this.pathDB,JSON.stringify(allProducts))                     
    }

    async getProducts() {
        const allProducts = await fs.readFile(this.pathDB, 'utf-8');
        const parsedProducts = JSON.parse(allProducts);
        if (Array.isArray(parsedProducts)) {
            return parsedProducts;
        } else {
            throw new Error('Products data structure is invalid');
        }
    }

    async getProductById(id){
        
            const allProducts = await this.getProducts();    
            // for(let i = 0;i<allProducts.products.length;i++) if(i+1 === id)return allProducts.products[i]
            const productoBuscado = await allProducts.find((p) => id === p.id);            
            if(productoBuscado!==undefined) return productoBuscado;
            else throw new Error("No existe el producto")                    
        
    }

    async updateProduct(id,nuevoObjeto){
        try{            
            const arrayNuevo = []
            console.log(typeof id)
            const copiaDeLosProductos = await this.getProducts();
            for(let i = 0; i < copiaDeLosProductos.length;i++){
                arrayNuevo.push((copiaDeLosProductos[i].id !== id)?copiaDeLosProductos[i]:nuevoObjeto)
            } 
            await fs.writeFile(this.pathDB,JSON.stringify(arrayNuevo))
        }catch(error){
            console.log(error);
        }
    }

    async deleteProduct(id){
        
        try{
        const todosLosProductos = await this.getProducts()
        for(let i = 0;i<todosLosProductos.length;i++){
            if(todosLosProductos[i].id === id){
                todosLosProductos.splice(i,1)
            }
        }
        await fs.writeFile(this.pathDB,JSON.stringify(todosLosProductos))
        }catch(error){
            console.log(error)
        }
    }

}   

export default ProductManager;