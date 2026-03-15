// ================================
// API CONFIG
// ================================

// detectar si estamos en desarrollo o producción
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
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

      console.error("HTTP ERROR:", response.status, response.statusText);

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

  return await apiRequest(`/stores/${slug}/products`);

}