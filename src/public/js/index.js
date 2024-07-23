

import ProductManager from "../../dao/fileManagers/productManager"

const listaProductos = document.getElementById("listaProductos")

const pManager = new ProductManager()

const data = await pManager.getProducts()

console.log("pocket check")
    
    if(data.length>0)
    data.forEach(p => {
        listaProductos.innerHTML += `           
        <h2>ID: ${p._id}</h2>                
        <h2>Titulo: ${p.title}</h2>                
        <h2>Precio: ${p.price}</h2>
        <h2>Stock: ${p.stock}</h2>
        <h2>Descripcion: ${p.description}</h2>
        <h2>Categoria: ${p.category}</h2>
        <h2>Codigo: ${p.code}</h2>
        <hr>
        `
    }); 