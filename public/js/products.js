import { getProducts } from "./api.js";


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

      const featured = products.filter(p => p.featured === true);

      productsToShow =
        featured.length > 0
          ? featured
          : products.slice(0,4);

    }

    // ================================
    // FILTRO CATEGORIA
    // ================================

    const categoryFilter = getQueryParam("category");

    if(categoryFilter){

      productsToShow = products.filter(p => {

        if(!p.category) return false;

        return String(p.category)
          .toLowerCase()
          .trim() === categoryFilter.toLowerCase().trim();

      });

    }

    // ================================
    // SIN PRODUCTOS
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
    // RENDER
    // ================================

    productsToShow.forEach(product => {

      const card = document.createElement("div");

      card.className = "product-card";

      // 🔥 IMAGEN
      let imageUrl =
        product.image ||
        product.images?.[0] ||
        "/assets/images/default.jpg";

      // 🔥 PRECIO
      const price =
        Number(product.price || 0).toLocaleString();

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

        if(
          product.images &&
          product.images.length > 0 &&
          typeof openImageGallery === "function"
        ){

          openImageGallery(product.images);

        }else if(typeof openImageZoom === "function"){

          openImageZoom(img.src);

        }

      });

      // ================================
      // ADD CART
      // ================================

      const btn = card.querySelector(".add-cart");

      btn.addEventListener("click", () => {

        // 🔥 VARIANTES
        if(
          product.variants &&
          product.variants.length > 0 &&
          typeof openVariantModal === "function"
        ){

          openVariantModal(product);

          return;

        }

        // 🔥 PRODUCTO CARRITO
        const cartProduct = {

          id: product.id,
          name: product.name,
          price: product.price,
          image: imageUrl

        };

        // 🔥 ADD CART
        if(typeof addToCart === "function"){

          addToCart(cartProduct);

        }else{

          console.warn("addToCart no existe");

        }

      });

    });

  }catch(error){

    console.error("Error cargando productos:", error);

    container.innerHTML = `
    <div class="text-center p-10 text-red-500">
      Error cargando productos
    </div>
    `;

  }

}