// ================================
// API CONFIG
// ================================

// detectar si estamos en desarrollo o producción
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://mercadia-back-production.up.railway.app/api";


// ================================
// REQUEST GENERICO
// ================================

async function apiRequest(endpoint) {

  try {

    const url = API_BASE + endpoint;

    console.log("API CALL:", url);

    const response = await fetch(url);

    if (!response.ok) {

      console.error("HTTP ERROR:", response.status);
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

  return await apiRequest(`/stores/${slug}`);

}


// ================================
// PRODUCTS
// ================================

export async function getProducts(store_id) {

  return await apiRequest(`/products/${store_id}`);

}