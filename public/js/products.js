import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";

export async function loadProducts(store_id) {

    const container = document.getElementById("products");

    container.innerHTML = "Cargando productos...";

    const products = await getProducts(store_id);

    if (!products || products.length === 0) {
        container.innerHTML = "No hay productos";
        return;
    }

    container.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card p-4 rounded shadow";

        card.innerHTML = `
        
        <img 
        src="/assets/images/${product.image || 'default.jpg'}" 
        class="w-full h-40 object-cover rounded mb-3"
        >

        <h3 class="text-lg font-semibold">
        ${product.name}
        </h3>

        <p class="text-sm opacity-70 mb-3">
        $${product.price}
        </p>

        <button 
        class="add-cart bg-black text-white px-4 py-2 rounded w-full"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        >
        Añadir
        </button>
        `;

        container.appendChild(card);
    });

    document.querySelectorAll(".add-cart").forEach(btn => {

        btn.addEventListener("click", () => {

            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: btn.dataset.price
            };

            addToCart(product);
        });

    });
}
