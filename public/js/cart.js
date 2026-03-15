const CART_KEY = "mercadia_cart";

function getCart() {

    const cart = localStorage.getItem(CART_KEY);

    return cart ? JSON.parse(cart) : [];

}

function saveCart(cart) {

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

}


// =======================
// AGREGAR AL CARRITO
// =======================

export function addToCart(product) {

    const cart = getCart();

    const existing = cart.find(p => p.id === product.id);

    if (existing) {

        existing.qty += 1;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            qty: 1
        });

    }

    saveCart(cart);

    updateCartCount();

}


// =======================
// CONTADOR
// =======================

export function updateCartCount() {

    const cart = getCart();

    const counter = document.getElementById("cart-count");

    if (!counter) return;

    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

    counter.textContent = totalItems;

}


// =======================
// CHECKOUT WHATSAPP
// =======================

export function checkout() {

    const cart = getCart();

    if (cart.length === 0) {

        alert("Carrito vacío");
        return;

    }

    let message = "Hola, quiero pedir:%0A%0A";

    let total = 0;

    cart.forEach(p => {

        const subtotal = p.price * p.qty;

        total += subtotal;

        message += `• ${p.name}%0A`;
        message += `  Cantidad: ${p.qty}%0A`;
        message += `  Subtotal: $${subtotal}%0A%0A`;

    });

    message += `TOTAL: $${total}`;

    const whatsapp = window.store?.whatsapp;

    if (!whatsapp) {

        alert("Número de WhatsApp no configurado.");
        return;

    }

    const url = `https://wa.me/${whatsapp}?text=${message}`;

    window.open(url, "_blank");

}


// =======================
// INIT
// =======================

document.addEventListener("DOMContentLoaded", updateCartCount);

window.checkout = checkout;