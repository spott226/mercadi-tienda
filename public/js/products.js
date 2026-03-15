import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";

const BACKEND_URL = "https://mercadia-back-production.up.railway.app";

/* =================================
CARGAR PRODUCTOS
================================= */

export async function loadProducts(slug) {

  // detecta si estamos en index o products
  const container =
    document.getElementById("products") ||
    document.getElementById("products-list");

  if (!container) return;

  container.innerHTML = "Cargando productos...";

  try {

    const products = await getProducts(slug);

    if (!products || products.length === 0) {

      container.innerHTML = `
        <div class="text-center p-10 opacity-60">
          No hay productos disponibles
        </div>
      `;

      return;
    }

    container.innerHTML = "";

    products.forEach(product => {

      const card = document.createElement("div");

      card.className =
        "product-card bg-white p-4 rounded shadow hover:shadow-lg transition";

      /* =============================
      URL DE IMAGEN
      ============================= */

      let imageUrl = "/assets/images/default.jpg";

      if (product.image) {

        if (product.image.startsWith("http")) {

          imageUrl = product.image;

        } else {

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

    /* =============================
    EVENTOS DEL CARRITO
    ============================= */

    document.querySelectorAll(".add-cart").forEach(btn => {

      btn.addEventListener("click", () => {

        const product = {

          id: Number(btn.dataset.id),
          name: btn.dataset.name,
          price: Number(btn.dataset.price)

        };

        addToCart(product);

      });

    });

  } catch (error) {

    console.error("Error cargando productos:", error);

    container.innerHTML = `
      <div class="text-center p-10 text-red-500">
        Error cargando productos
      </div>
    `;

  }

}