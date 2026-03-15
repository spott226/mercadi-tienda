const API_BASE = "http://localhost:3000/api";

async function apiRequest(endpoint) {

    try {

        const url = API_BASE + endpoint;

        console.log("API CALL:", url);

        const response = await fetch(url);

        if (!response.ok) {
            console.error("HTTP ERROR", response.status);
            return null;
        }

        return await response.json();

    } catch (error) {

        console.error("API ERROR:", error);
        return null;

    }

}

export async function getStore(slug) {
    return await apiRequest(`/store/${slug}`);
}

export async function getProducts(store_id) {
    return await apiRequest(`/products/${store_id}`);
}