import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";

const BACKEND_URL = "https://mercadia-back-production.up.railway.app";


function getQueryParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}


/* =================================
AGRUPAR VARIANTES POR COLOR
================================= */

function groupVariants(variants){

  const grouped = {};

  variants.forEach(v => {

    if(!grouped[v.color]){
      grouped[v.color] = [];
    }

    grouped[v.color].push(v);

  });

  return grouped;
}


/* =================================
MODAL VARIANTES
================================= */

function openVariantModal(product){

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/40 flex items-center justify-center z-50";

  const grouped = groupVariants(product.variants || []);
  const colors = Object.keys(grouped);

  let currentColor = null; // 🔥 inicia sin color

  function render(){

    let image = product.image; // 🔥 SIEMPRE principal al inicio
    let sizes = [];

    if(currentColor){
      const variants = grouped[currentColor] || [];
      sizes = variants.map(v => v.size);

      const imgByColor = product.images?.find(img => img.color === currentColor);
      if(imgByColor){
        image = imgByColor.image_url;
      }
    }

    overlay.innerHTML = `
    <div class="bg-white p-6 rounded w-[420px] max-w-[90%]">

      <h2 class="text-lg font-bold mb-4">
        ${product.name}
      </h2>

      <div class="mb-4 text-center">
        <img src="${image}" style="max-height:180px;margin:auto;">
      </div>

      ${colors.length ? `
      <div class="mb-4">
        <div class="font-semibold mb-2">Color</div>
        <select id="variant-color" class="w-full border p-2 rounded">
          <option value="">Selecciona color</option>
          ${colors.map(c=>`
            <option value="${c}" ${c===currentColor?"selected":""}>${c}</option>
          `).join("")}
        </select>
      </div>
      ` : ""}

      <div class="mb-4">
        <div class="font-semibold mb-2">Talla</div>
        <select id="variant-size" class="w-full border p-2 rounded">
          ${
            sizes.length
            ? sizes.map(s=>`<option value="${s}">${s}</option>`).join("")
            : `<option>Selecciona color primero</option>`
          }
        </select>
      </div>

      <div class="flex gap-3 mt-6">

        <button id="variant-cancel" class="flex-1 border p-2 rounded">
          Cancelar
        </button>

        <button id="variant-add" class="flex-1 bg-black text-white p-2 rounded">
          Añadir
        </button>

      </div>

    </div>
    `;

    // 🔥 EVENTOS

    document.getElementById("variant-color")?.addEventListener("change",(e)=>{
      currentColor = e.target.value || null;
      render();
    });

    document.getElementById("variant-cancel").onclick = () => {
      overlay.remove();
    };

    document.getElementById("variant-add").onclick = () => {

      const color = currentColor;
      const size = document.getElementById("variant-size")?.value || null;

      let variant = null;

      if(color){
        variant = product.variants.find(v =>
          v.color === color && v.size === size
        );
      }

      const imgByColor = product.images?.find(img => img.color === color);

      const cartProduct = {
        id: product.id,
        name: product.name,
        price: variant?.price || product.price,
        image: imgByColor?.image_url || product.image,
        color,
        size
      };

      addToCart(cartProduct);

      overlay.remove();

    };

  }

  render();

  document.body.appendChild(overlay);

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

    let productsToShow = products;

    if(featuredContainer){

      const featured = products.filter(p => p.featured === true);

      productsToShow = featured.length ? featured : products.slice(0,4);

    }

    const categoryFilter = getQueryParam("category");

    if(categoryFilter){

      productsToShow = products.filter(p =>
        String(p.category).toLowerCase() === categoryFilter.toLowerCase()
      );

    }

    if(productsToShow.length === 0){

      container.innerHTML = `
      <div class="text-center p-10 opacity-60">
        No hay productos en esta categoría
      </div>
      `;

      return;

    }

    productsToShow.forEach(product => {

      const card = document.createElement("div");
      card.className = "product-card";

      // 🔥 SIEMPRE IMAGEN PRINCIPAL
      let imageUrl = product.image || "/assets/images/default.jpg";

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

          <button class="product-btn add-cart">
            Añadir
          </button>

        </div>

      `;

      container.appendChild(card);

      const btn = card.querySelector(".add-cart");

      btn.addEventListener("click", () => {

        if(product.variants && product.variants.length){
          openVariantModal(product);
          return;
        }

        const cartProduct = {
          id:product.id,
          name:product.name,
          price:product.price,
          image:imageUrl
        };

        addToCart(cartProduct);

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