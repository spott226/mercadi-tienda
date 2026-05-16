import { getProducts } from "./api.js";

export async function loadProducts(slug){

  const featuredContainer = document.getElementById("products");
  const allContainer = document.getElementById("products-list");

  const container = featuredContainer || allContainer;

  if(!container) return;

  container.innerHTML = "Cargando productos...";

  try{

    // 🔥 FIX REAL
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

      productsToShow = featured.length
        ? featured
        : products.slice(0,4);

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

      let imageUrl =
        product.image ||
        product.images?.[0] ||
        "/assets/images/default.jpg";

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

      const img = card.querySelector("img");

      img.addEventListener("click", (e) => {

        e.stopPropagation();

        if(product.images && product.images.length > 0){

          openImageGallery(product.images);

        }else{

          openImageZoom(img.src);

        }

      });

      const btn = card.querySelector(".add-cart");

      btn.addEventListener("click", () => {

        if(product.variants && product.variants.length){

          openVariantModal(product);

          return;

        }

        const cartProduct = {

          id: product.id,
          name: product.name,
          price: product.price,
          image: imageUrl

        };

        addToCart(cartProduct);

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