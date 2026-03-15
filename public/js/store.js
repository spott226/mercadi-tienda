import { getStore } from "./api.js";
import { loadProducts } from "./products.js";

let storeData = null;

function getSlugFromDomain() {

    const host = window.location.hostname;

    // entorno local
    if (host === "localhost" || host === "127.0.0.1") {
        return "chelispa";   // <-- cambia entre "demo" o "chelispa" para probar
    }

    const parts = host.split(".");
    return parts[0];
}

async function initStore() {

    const slug = getSlugFromDomain();

    const store = await getStore(slug);

    if (!store) {
        document.body.innerHTML = "<h1>Tienda no encontrada</h1>";
        return;
    }

    storeData = store;

    window.store = store;

    document.title = store.name;

    document.body.classList.add(`theme-${store.theme}`);

    const title = document.getElementById("store-name");
    if (title) title.textContent = store.name;

    loadProducts(store.id);
}

document.addEventListener("DOMContentLoaded", initStore);
