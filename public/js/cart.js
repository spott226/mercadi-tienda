const CART_KEY = "mercadia_cart";

function getCart() {

    const cart = localStorage.getItem(CART_KEY);

    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product) {

    const cart = getCart();

    cart.push(product);

    saveCart(cart);

    updateCartCount();
}

export function updateCartCount() {

    const cart = getCart();

    const counter = document.getElementById("cart-count");

    if (counter) {
        counter.textContent = cart.length;
    }
}

export function checkout() {

    const cart = getCart();

    if (cart.length === 0) {
        alert("Carrito vacío");
        return;
    }

    let message = "Hola quiero pedir:%0A";

    cart.forEach(p => {
        message += `• ${p.name} - $${p.price}%0A`;
    });

    const whatsapp = window.store.whatsapp;

    const url = `https://wa.me/${whatsapp}?text=${message}`;

    window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", updateCartCount);

window.checkout = checkout;