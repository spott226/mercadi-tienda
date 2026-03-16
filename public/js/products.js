import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";

const BACKEND_URL = "https://mercadia-back-production.up.railway.app";


/* =================================
OBTENER PARAMETRO DE URL
================================= */

function getQueryParam(name){

const params = new URLSearchParams(window.location.search);
return params.get(name);

}


/* =================================
CARGAR PRODUCTOS
================================= */

export async function loadProducts(slug){

const featuredContainer = document.getElementById("products");
const allContainer = document.getElementById("products-list");

const container = featuredContainer || allContainer;

if(!container) return;

container.innerHTML = "Cargando productos...";

try{

const products = await getProducts(slug);

if(!products || products.length === 0){

container.innerHTML = `
<div class="text-center p-10 opacity-60">
No hay productos disponibles
</div>
`;

return;

}

container.innerHTML = "";


/* =================================
PRODUCTOS A MOSTRAR
================================= */

let productsToShow = products;


/* =================================
FEATURED SOLO EN INDEX
================================= */

if(featuredContainer){

const featured = products.filter(p => p.featured === true);

productsToShow = featured.length ? featured : products.slice(0,4);

}


/* =================================
FILTRO POR CATEGORIA
================================= */

const categoryFilter = getQueryParam("category");

if(categoryFilter){

productsToShow = products.filter(p =>
String(p.category).toLowerCase() === categoryFilter.toLowerCase()
);

}


/* =================================
SIN RESULTADOS
================================= */

if(productsToShow.length === 0){

container.innerHTML = `
<div class="text-center p-10 opacity-60">
No hay productos en esta categoría
</div>
`;

return;

}


/* =================================
RENDER PRODUCTOS
================================= */

productsToShow.forEach(product => {

const card = document.createElement("div");

card.className = "product-card";


let imageUrl = "/assets/images/default.jpg";

if(product.image){

if(product.image.startsWith("http")){

imageUrl = product.image;

}else{

imageUrl = `${BACKEND_URL}/uploads/${product.image}`;

}

}


card.innerHTML = `

<div class="product-image">

<img
src="${imageUrl}"
loading="lazy"
onerror="this.src='/assets/images/default.jpg'"
>

</div>

<div class="product-info">

<div class="product-title">
${product.name}
</div>

<div class="product-price">
$${Number(product.price).toLocaleString()}
</div>

<button
class="product-btn add-cart"
data-id="${product.id}"
data-name="${product.name}"
data-price="${product.price}"
>
Añadir
</button>

</div>

`;

container.appendChild(card);

});


/* =================================
EVENTOS CARRITO
================================= */

container.querySelectorAll(".add-cart").forEach(btn => {

btn.addEventListener("click", () => {

const product = {

id:Number(btn.dataset.id),
name:btn.dataset.name,
price:Number(btn.dataset.price)

};

addToCart(product);

});

});

}catch(error){

console.error("Error cargando productos:",error);

container.innerHTML = `
<div class="text-center p-10 text-red-500">
Error cargando productos
</div>
`;

}

}