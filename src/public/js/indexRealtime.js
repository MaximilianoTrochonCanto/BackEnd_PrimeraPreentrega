
const title = document.getElementById('txtTitle');
const price = document.getElementById('txtPrecio');
const stock = document.getElementById('txtStock');
const description = document.getElementById('txtDescription');
const category = document.getElementById('txtCategory');
const code = document.getElementById('txtCode');
const listaProductos = document.getElementById('listaProductos');
const idProd = document.getElementById('txtProductoBorrar');
const botonBorrar = document.getElementById('btnBorrar');

// Handle form submission for adding a new product


// Handle product logs from server to update the view
socket.on('prod-logs', (data) => {
    console.log("Que?")
  listaProductos.innerHTML = '';
  if (data.length > 0) {
    data.forEach((p) => {
      listaProductos.innerHTML += `
        <h2>ID: ${p._id}</h2>                
        <h2>Titulo: ${p.title}</h2>                
        <h2>Precio: ${p.price}</h2>
        <h2>Stock: ${p.stock}</h2>
        <h2>Descripcion: ${p.description}</h2>
        <h2>Categoria: ${p.category}</h2>
        <h2>Codigo: ${p.code}</h2>
        <hr>
      `;
    });
  }
});

// Handle product deletion
botonBorrar.addEventListener('click', (e) => {
  e.preventDefault();
  socket.emit('borrar-prod', idProd.value);
});
