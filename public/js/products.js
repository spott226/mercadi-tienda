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

const featuredContainer = document.getElementById("products");     // index
const allContainer = document.getElementById("products-list");     // products.html

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
FILTRO FEATURED EN INDEX
================================= */

let productsToShow = products;

if(featuredContainer){

const featured = products.filter(p => p.featured === true);

productsToShow = featured.length ? featured : products.slice(0,4);

}


/* =================================
FILTRO POR CATEGORIA
================================= */

const categoryFilter = getQueryParam("category");

if(categoryFilter){

productsToShow = productsToShow.filter(p =>
p.category?.toLowerCase() === categoryFilter.toLowerCase()
);

}


/* =================================
RENDER PRODUCTOS
================================= */

productsToShow.forEach(product => {

const card = document.createElement("div");

card.className =
"product-card bg-white p-4 rounded shadow hover:shadow-lg transition";

let imageUrl = "/assets/images/default.jpg";

if(product.image){

if(product.image.startsWith("http")){

imageUrl = product.image;

}else{

imageUrl = `${BACKEND_URL}/uploads/${product.image}`;

}

}

card.innerHTML = `
<img
src="${imageUrl}"
class="w-full h-40 object-cover rounded mb-3"
loading="lazy"
onerror="this.src='/assets/images/default.jpg'"
>

<h3 class="text-lg font-semibold mb-1">
${product.name}
</h3>

<p class="text-sm opacity-70 mb-3">
$${Number(product.price).toLocaleString()}
</p>

<button
class="add-cart bg-black text-white px-4 py-2 rounded w-full hover:opacity-80 transition"
data-id="${product.id}"
data-name="${product.name}"
data-price="${product.price}"
>
Añadir
</button>
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