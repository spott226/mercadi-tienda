// ================================
// API CONFIG
// ================================

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://mercadia-back-production.up.railway.app/api";


// ================================
// REQUEST GENERICO
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

      console.error(
        "HTTP ERROR:",
        response.status,
        text
      );

      throw new Error(
        text || "Error API"
      );

    }

    const data = await response.json();

    console.log("API RESPONSE:", data);

    return data;

  } catch (error) {

    console.error("API ERROR:", error);

    return null;

  }

}

function normalizeProductsResponse(response){

  if(!response){
    return [];
  }

  const products =
    Array.isArray(response)
      ? response
      : (response.products || []);

  return products.map(p => ({
    ...p,
    images: p.images || [],
    variants: p.variants || []
  }));

}


// ================================
// STORE
// ================================

export async function getStore(slug) {

  if (!slug) {
    console.error("STORE ERROR: slug vacio");
    return null;
  }

  return await apiRequest(`/stores/${slug}`);

}


// ================================
// PRODUCTS
// ================================

export async function getProducts(slug) {

  if (!slug) {
    console.error("PRODUCTS ERROR: slug vacio");
    return [];
  }

  const storefrontResponse =
    await apiRequest(`/stores/${slug}/products`);

  if(storefrontResponse){
    return normalizeProductsResponse(storefrontResponse);
  }

  const store = await getStore(slug);

  if (!store || !store.id) {
    console.error("STORE NOT FOUND");
    return [];
  }

  const legacyResponse =
    await apiRequest(`/products/${store.id}`);

  return normalizeProductsResponse(legacyResponse);

}


// ================================
// PROMOTION
// ================================

export async function getActivePromotion(slug){

  if(!slug){
    return null;
  }

  const response =
    await apiRequest(`/stores/${slug}/promotion`);

  if(!response || !response.success){
    return null;
  }

  return response.promotion || null;

}


// ================================
// CREATE ORDER ERP
// ================================

export async function createOrder(orderData){

  if(!orderData){
    console.error("ORDER ERROR: datos vacios");
    return null;
  }

  return await apiRequest("/orders", {

    method: "POST",

    body: JSON.stringify(orderData)

  });

}
