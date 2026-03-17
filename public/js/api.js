// ================================
// API CONFIG
// ================================

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://mercadia-back-production.up.railway.app/api";


// ================================
// REQUEST GENERICO (MEJORADO)
// ================================

async function apiRequest(endpoint, options = {}) {

  try {

    const url = API_BASE + endpoint;

    console.log("API CALL:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {

      const text = await response.text();

      console.error("HTTP ERROR:", response.status, text);

      return null;

    }

    const data = await response.json();

    console.log("API RESPONSE:", data);

    return data;

  } catch (error) {

    console.error("API ERROR:", error);

    return null;

  }

}


// ================================
// STORE
// ================================

export async function getStore(slug) {

  if (!slug) {
    console.error("STORE ERROR: slug vacío");
    return null;
  }

  return await apiRequest(`/stores/${slug}`);

}


// ================================
// PRODUCTS
// ================================

export async function getProducts(slug) {

  if (!slug) {
    console.error("PRODUCTS ERROR: slug vacío");
    return [];
  }

  const store = await getStore(slug);

  if(!store || !store.id){
    console.error("STORE NOT FOUND");
    return [];
  }

  const products = await apiRequest(`/products/${store.id}`);

  if(!products){
    return [];
  }

  // 🔥 NORMALIZAR IMÁGENES (CLAVE)
  return products.map(p => {

    // asegurar estructura
    p.images = p.images || [];
    p.variants = p.variants || [];

    return p;

  });

}