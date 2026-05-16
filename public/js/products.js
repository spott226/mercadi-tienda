import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";

import {
  getQueryParam
} from "./utils.js";



/* =================================
ZOOM IMAGEN (sin variantes)
================================= */

function openImageZoom(src){

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/90 flex items-center justify-center z-50";

  overlay.innerHTML = `
    <div class="relative">
      <span id="closeZoom"
        style="position:absolute;top:-40px;right:0;color:white;font-size:30px;cursor:pointer;">
        ✕
      </span>

      <img src="${src}"
        style="max-width:90vw;max-height:90vh;border-radius:12px;">
    </div>
  `;

  overlay.querySelector("#closeZoom").onclick = () => overlay.remove();

  overlay.onclick = (e) => {
    if(e.target === overlay){
      overlay.remove();
    }
  };

  document.body.appendChild(overlay);
}



/* =================================
GALERÍA
================================= */

function openImageGallery(images){

  let currentIndex = 0;

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/95 flex items-center justify-center z-50";

  function render(){

    overlay.innerHTML = `
      <div class="relative flex items-center justify-center">

        <span id="close"
          style="position:absolute;top:-50px;right:0;color:white;font-size:30px;cursor:pointer;">
          ✕
        </span>

        <span id="prev"
          style="position:absolute;left:-50px;color:white;font-size:40px;cursor:pointer;">
          ‹
        </span>

        <img src="${images[currentIndex].image_url}"
          style="max-width:90vw;max-height:90vh;border-radius:12px;">

        <span id="next"
          style="position:absolute;right:-50px;color:white;font-size:40px;cursor:pointer;">
          ›
        </span>

      </div>
    `;

    overlay.querySelector("#close").onclick = () => overlay.remove();

    overlay.querySelector("#prev").onclick = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      render();
    };

    overlay.querySelector("#next").onclick = () => {
      currentIndex = (currentIndex + 1) % images.length;
      render();
    };

  }

  render();

  document.body.appendChild(overlay);
}



/* =================================
VARIANTES
================================= */

function openVariantModal(product){

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/40 flex items-center justify-center z-50";

  let currentColor = null;
  let currentSize = null;

  const grouped = {};

  (product.variants || []).forEach(v=>{
    if(!grouped[v.color]) grouped[v.color] = [];
    grouped[v.color].push(v);
  });

  const colors = Object.keys(grouped);

  function render(){

    let image = product.image;
    let sizes = [];

    if(currentColor){
      sizes = grouped[currentColor].map(v => v.size);
    }

    overlay.innerHTML = `
      <div class="product-modal p-6 rounded w-[420px] max-w-[90%]">

        <h2 class="text-lg font-bold mb-4">${product.name}</h2>

        <div class="mb-4 text-center">
          <img src="${image}" style="max-height:180px;margin:auto;">
        </div>

        <div class="mb-4">
          <select id="color">
            <option value="">Color</option>
            ${colors.map(c=>`<option value="${c}">${c}</option>`).join("")}
          </select>
        </div>

        <div class="mb-4">
          <select id="size">
            <option value="">Talla</option>
            ${sizes.map(s=>`<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>

        <button id="add">Añadir</button>

      </div>
    `;

    overlay.querySelector("#color").onchange = (e)=>{
      currentColor = e.target.value;
      currentSize = null;
      render();
    };

    overlay.querySelector("#size").onchange = (e)=>{
      currentSize = e.target.value;
    };

    overlay.querySelector("#add").onclick = ()=>{

      if(!currentColor || !currentSize){
        alert("Selecciona color y talla");
        return;
      }

      const variant = grouped[currentColor].find(v => v.size === currentSize);

      addToCart({
        id: product.id,
        variant_id: variant.id,
        name: product.name,
        price: variant.price,
        image: product.image,
        color: currentColor,
        size: currentSize
      });

      overlay.remove();
    };

  }

  render();

  document.body.appendChild(overlay);
}



/* =================================
LOAD PRODUCTS
================================= */

export async function loadProducts(slug){

  const container =
    document.getElementById("products-list") ||
    document.getElementById("products");

  if(!container) return;

  container.innerHTML = "Cargando...";

  try{

    const response = await getProducts(slug);

    const products = response?.products || [];

    if(!products.length){
      container.innerHTML = "No hay productos";
      return;
    }

    container.innerHTML = "";

    const category = getQueryParam("category");

    let filtered = products;

    if(category){
      filtered = products.filter(p =>
        String(p.category).toLowerCase() === category.toLowerCase()
      );
    }

    filtered.forEach(product => {

      const card = document.createElement("div");
      card.className = "product-card";

      const image = product.image || "/assets/images/default.jpg";

      card.innerHTML = `
        <img src="${image}" />
        <h3>${product.name}</h3>
        <p>$${product.price}</p>
        <button>Añadir</button>
      `;

      container.appendChild(card);

      card.querySelector("img").onclick = () => {
        openImageZoom(image);
      };

      card.querySelector("button").onclick = () => {

        if(product.variants?.length){
          openVariantModal(product);
          return;
        }

        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image
        });

      };

    });

  }catch(err){
    console.error(err);
    container.innerHTML = "Error cargando productos";
  }

}