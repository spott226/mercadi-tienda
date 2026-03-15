const CART_KEY = "mercadia_cart";

function getCart(){

const cart = localStorage.getItem(CART_KEY);

return cart ? JSON.parse(cart) : [];

}

function saveCart(cart){

localStorage.setItem(CART_KEY, JSON.stringify(cart));

}



// =======================
// AGREGAR AL CARRITO
// =======================

export function addToCart(product){

const cart = getCart();

const existing = cart.find(p => p.id === product.id);

if(existing){

existing.qty += 1;

}else{

cart.push({
id:product.id,
name:product.name,
price:Number(product.price),
qty:1
});

}

saveCart(cart);

updateCartCount();

}



// =======================
// CONTADOR
// =======================

export function updateCartCount(){

const cart = getCart();

const counter = document.getElementById("cart-count");

if(!counter) return;

const totalItems = cart.reduce((acc,item)=>acc + item.qty,0);

counter.textContent = totalItems;

}



// =======================
// MOSTRAR CARRITO
// =======================

export function openCart(){

const cart = getCart();

const container = document.getElementById("cart-items");

if(!container) return;

container.innerHTML = "";

let total = 0;

if(cart.length === 0){

container.innerHTML = `
<p class="text-center text-gray-500 py-4">
Tu carrito está vacío
</p>
`;

}

cart.forEach((p,index)=>{

const subtotal = p.price * p.qty;

total += subtotal;

container.innerHTML += `

<div class="flex justify-between items-center border-b py-3">

<div>

<p class="font-semibold">${p.name}</p>

<p class="text-sm opacity-70">
$${p.price} x ${p.qty}
</p>

</div>

<div class="flex items-center gap-3">

<span class="font-bold">$${subtotal}</span>

<button
onclick="removeItem(${index})"
class="text-red-500 text-sm hover:underline"
>
Eliminar
</button>

</div>

</div>

`;

});

const totalElement = document.getElementById("cart-total");

if(totalElement){

totalElement.innerText = "$" + total;

}

const modal = document.getElementById("cart-modal");

if(modal){

modal.classList.remove("hidden");

}

}



// =======================
// CERRAR CARRITO
// =======================

export function closeCart(){

const modal = document.getElementById("cart-modal");

if(modal){

modal.classList.add("hidden");

}

}



// =======================
// ELIMINAR PRODUCTO
// =======================

export function removeItem(index){

const cart = getCart();

cart.splice(index,1);

saveCart(cart);

updateCartCount();

openCart();

}



// =======================
// CHECKOUT WHATSAPP
// =======================

export function checkout(){

const cart = getCart();

if(cart.length === 0){

alert("Carrito vacío");

return;

}

let message = "Hola, quiero pedir:%0A%0A";

let total = 0;

cart.forEach(p=>{

const subtotal = p.price * p.qty;

total += subtotal;

message += `• ${p.name}%0A`;
message += `Cantidad: ${p.qty}%0A`;
message += `Subtotal: $${subtotal}%0A%0A`;

});

message += `TOTAL: $${total}`;

const whatsapp = window.store?.whatsapp;

if(!whatsapp){

alert("Número de WhatsApp no configurado.");

return;

}

const phone = String(whatsapp).replace(/\D/g,"");

const url = `https://wa.me/${phone}?text=${message}`;

window.open(url,"_blank");

}



// =======================
// INIT
// =======================

document.addEventListener("DOMContentLoaded",updateCartCount);

window.openCart = openCart;
window.closeCart = closeCart;
window.removeItem = removeItem;
window.checkout = checkout;