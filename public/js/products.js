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
MODAL VARIANTES
================================= */

function openVariantModal(product){

  // crear fondo modal
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/40 flex items-center justify-center z-50";

  // colores únicos
  const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];

  // tallas únicas
  const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];

  overlay.innerHTML = `
  <div class="bg-white p-6 rounded w-[420px] max-w-[90%]">

    <h2 class="text-lg font-bold mb-4">
      ${product.name}
    </h2>

    ${colors.length ? `
    <div class="mb-4">
      <div class="font-semibold mb-2">Color</div>
      <select id="variant-color" class="w-full border p-2 rounded">
        ${colors.map(c=>`<option value="${c}">${c}</option>`).join("")}
      </select>
    </div>
    ` : ""}

    ${sizes.length ? `
    <div class="mb-4">
      <div class="font-semibold mb-2">Talla</div>
      <select id="variant-size" class="w-full border p-2 rounded">
        ${sizes.map(s=>`<option value="${s}">${s}</option>`).join("")}
      </select>
    </div>
    ` : ""}

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

  document.body.appendChild(overlay);

  // cancelar
  overlay.querySelector("#variant-cancel").onclick = () => {
    overlay.remove();
  };

  // agregar carrito
  overlay.querySelector("#variant-add").onclick = () => {

    const color = document.getElementById("variant-color")?.value || null;
    const size = document.getElementById("variant-size")?.value || null;

    const variant = product.variants.find(v =>
      (color ? v.color === color : true) &&
      (size ? v.size === size : true)
    );

    const cartProduct = {
      id: product.id,
      name: product.name,
      price: variant?.price || product.price,
      color,
      size
    };

    addToCart(cartProduct);

    overlay.remove();

  };

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
          >
            Añadir
          </button>

        </div>

      `;

      container.appendChild(card);

      const btn = card.querySelector(".add-cart");

      btn.addEventListener("click", () => {

        // si tiene variantes
        if(product.variants && product.variants.length){

          openVariantModal(product);
          return;

        }

        // producto normal
        const cartProduct = {
          id:product.id,
          name:product.name,
          price:product.price
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