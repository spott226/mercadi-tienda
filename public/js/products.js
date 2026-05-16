import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";
import { openVariantModal } from "./variants.js";


// ================================
// GET QUERY PARAM
// ================================

function getQueryParam(param){

  const params = new URLSearchParams(window.location.search);

  return params.get(param);

}


// ================================
// LOAD PRODUCTS
// ================================

export async function loadProducts(slug){

  const featuredContainer = document.getElementById("products");
  const allContainer = document.getElementById("products-list");

  const container = featuredContainer || allContainer;

  if(!container) return;

  container.innerHTML = "Cargando productos...";

  try{

    // 🔥 OBTENER PRODUCTOS
    const products = await getProducts(slug);

    console.log("PRODUCTS:", products);

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

    // ================================
    // FEATURED
    // ================================

    if(featuredContainer){

      const featured = products.filter(
        p => p.featured === true
      );

      productsToShow =
        featured.length > 0
          ? featured
          : products.slice(0,4);

    }

    // ================================
    // CATEGORY FILTER
    // ================================

    const categoryFilter = getQueryParam("category");

    if(categoryFilter){

      productsToShow = products.filter(p => {

        if(!p.category) return false;

        return String(p.category)
          .toLowerCase()
          .trim() === categoryFilter
          .toLowerCase()
          .trim();

      });

    }

    // ================================
    // NO PRODUCTS
    // ================================

    if(productsToShow.length === 0){

      container.innerHTML = `
      <div class="text-center p-10 opacity-60">
        No hay productos en esta categoría
      </div>
      `;

      return;

    }

    // ================================
    // RENDER PRODUCTS
    // ================================

    productsToShow.forEach(product => {

      const card = document.createElement("div");

      card.className = "product-card";

      // ================================
      // IMAGE
      // ================================

      let imageUrl =
        product.image ||
        product.images?.[0] ||
        "/assets/images/default.jpg";

      // ================================
      // PRICE
      // ================================

      const price =
        Number(product.price || 0)
        .toLocaleString();

      // ================================
      // CARD HTML
      // ================================

      card.innerHTML = `

        <div class="product-image">

          <img
            src="${imageUrl}"
            alt="${product.name}"
            loading="lazy"
            onerror="this.src='/assets/images/default.jpg'"
          >

        </div>

        <div class="product-info">

          <div class="product-title">
            ${product.name || "Producto"}
          </div>

          <div class="product-price">
            $${price}
          </div>

          <button class="product-btn add-cart">
            Añadir
          </button>

        </div>

      `;

      container.appendChild(card);

      // ================================
      // IMAGE CLICK
      // ================================

      const img = card.querySelector("img");

      img.addEventListener("click", (e) => {

        e.stopPropagation();

        // 🔥 ABRIR GALERIA
        if(
          product.images &&
          product.images.length > 0 &&
          typeof openImageGallery === "function"
        ){

          openImageGallery(product.images);

        }else if(
          typeof openImageZoom === "function"
        ){

          openImageZoom(img.src);

        }

      });

      // ================================
      // ADD CART
      // ================================

      const btn = card.querySelector(".add-cart");

      btn.addEventListener("click", () => {

        console.log("PRODUCT CLICK:", product);

        // 🔥 SI TIENE VARIANTES
        if(
          product.variants &&
          product.variants.length > 0
        ){

          console.log(
            "OPENING VARIANTS:",
            product.variants
          );

          openVariantModal(product);

          return;

        }

        // 🔥 PRODUCTO NORMAL
        const cartProduct = {

          id: product.id,
          name: product.name,
          price: product.price,
          image: imageUrl,
          quantity: 1

        };

        // 🔥 AGREGAR CARRITO
        addToCart(cartProduct);

      });

    });

  }catch(error){

    console.error(
      "Error cargando productos:",
      error
    );

    container.innerHTML = `
    <div class="text-center p-10 text-red-500">
      Error cargando productos
    </div>
    `;

  }

}