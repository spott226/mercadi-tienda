import { getStore } from "./api.js";
import { loadProducts } from "./products.js";

let storeData = null;

// =================================
// OBTENER SLUG DESDE DOMINIO
// =================================

function getSlugFromDomain() {

    const host = window.location.hostname;

    console.log("HOST:", host);

    // entorno local
    if (host === "localhost" || host === "127.0.0.1") {

        console.log("LOCAL ENVIRONMENT");
        return "chelispa";

    }

    const parts = host.split(".");

    // ejemplo: chelispa.mercadia.mx
    const slug = parts[0];

    console.log("DETECTED SLUG:", slug);

    return slug;

}


// =================================
// INICIALIZAR TIENDA
// =================================

async function initStore() {

    try {

        const slug = getSlugFromDomain();

        console.log("LOADING STORE:", slug);

        const store = await getStore(slug);

        if (!store) {

            document.body.innerHTML = `
                <div style="text-align:center;margin-top:100px;font-family:sans-serif;">
                    <h1>Tienda no encontrada</h1>
                    <p>El dominio no corresponde a ninguna tienda.</p>
                </div>
            `;

            return;

        }

        storeData = store;

        // variables globales
        window.store = store;
        window.store_id = store.id;
        window.store_whatsapp = store.whatsapp;

        console.log("STORE DATA:", store);

        // ================================
        // TITULO
        // ================================

        document.title = store.name || "Mercadia";

        // ================================
        // TEMA
        // ================================

        if (store.theme) {

            document.body.classList.add(`theme-${store.theme}`);

        }

        // ================================
        // NOMBRE TIENDA
        // ================================

        const title = document.getElementById("store-name");

        if (title && store.name) {

            title.textContent = store.name;

        }

        // ================================
        // LOGO DINAMICO
        // ================================

        const logo = document.getElementById("store-logo");

        if (logo && store.logo) {

            logo.src =
                "https://mercadia-back-production.up.railway.app/uploads/" +
                store.logo;

        }

        // ================================
        // HERO TEXT
        // ================================

        const heroTitle = document.getElementById("hero-title");
        const heroText = document.getElementById("hero-text");

        if (heroTitle && store.hero_title) {

            heroTitle.textContent = store.hero_title;

        }

        if (heroText && store.hero_text) {

            heroText.textContent = store.hero_text;

        }

        // ================================
        // HERO IMAGEN
        // ================================

        const hero = document.getElementById("hero-image");

        if (hero && store.hero) {

            hero.src =
                "https://mercadia-back-production.up.railway.app/uploads/" +
                store.hero;

        }

        // ================================
        // CARGAR PRODUCTOS
        // ================================

        await loadProducts(slug);

    } catch (error) {

        console.error("STORE INIT ERROR:", error);

        document.body.innerHTML = `
            <div style="text-align:center;margin-top:100px;font-family:sans-serif;">
                <h1>Error cargando tienda</h1>
                <p>Intenta recargar la página.</p>
            </div>
        `;

    }

}


// =================================
// INICIO
// =================================

document.addEventListener("DOMContentLoaded", initStore);