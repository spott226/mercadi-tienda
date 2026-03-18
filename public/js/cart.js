const CART_KEY = "mercadia_cart";

function getCart(){
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


/* =======================
AGREGAR AL CARRITO
======================= */

export function addToCart(product){

  const cart = getCart();

  const existing = cart.find(p => 
    p.id === product.id &&
    p.color === product.color &&
    p.size === product.size
  );

  if(existing){
    existing.qty += 1;
  }else{
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      qty: 1,
      color: product.color || null,
      size: product.size || null,
      image: product.image || null
    });
  }

  saveCart(cart);
  updateCartCount();
}


/* =======================
CONTADOR
======================= */

export function updateCartCount(){

  const cart = getCart();
  const counter = document.getElementById("cart-count");

  if(!counter) return;

  const totalItems = cart.reduce((acc,item)=>acc + item.qty,0);
  counter.textContent = totalItems;
}


/* =======================
MOSTRAR CARRITO
======================= */

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
    <div class="flex gap-3 border-b py-3">

      <img 
        src="${p.image || '/assets/images/default.jpg'}" 
        style="width:60px;height:60px;object-fit:cover;border-radius:6px;"
      >

      <div class="flex-1">

        <p class="font-semibold">${p.name}</p>

        <p class="text-sm opacity-70">
        ${p.color ? `Color: ${p.color}<br>` : ""}
        ${p.size ? `Talla: ${p.size}<br>` : ""}
        $${p.price} x ${p.qty}
        </p>

      </div>

      <div class="text-right">

        <p class="font-bold">$${subtotal}</p>

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


/* =======================
CERRAR CARRITO
======================= */

export function closeCart(){

  const modal = document.getElementById("cart-modal");

  if(modal){
    modal.classList.add("hidden");
  }

}


/* =======================
ELIMINAR PRODUCTO
======================= */

export function removeItem(index){

  const cart = getCart();

  cart.splice(index,1);

  saveCart(cart);
  updateCartCount();
  openCart();

}


/* =======================
ABRIR FORM CHECKOUT
======================= */

export function checkout(){

  const cart = getCart();

  if(cart.length === 0){
    alert("Carrito vacío");
    return;
  }

  const modal = document.getElementById("checkout-modal");

  if(modal){
    modal.classList.remove("hidden");
  }

}


/* =======================
CERRAR FORM
======================= */

export function closeCheckout(){
  const modal = document.getElementById("checkout-modal");
  if(modal){
    modal.classList.add("hidden");
  }
}


/* =======================
ENVIAR A WHATSAPP
======================= */

export function sendCheckout(){

  const cart = getCart();

  const name = document.getElementById("c-name").value;
  const phoneClient = document.getElementById("c-phone").value;
  const address = document.getElementById("c-address").value;
  const colony = document.getElementById("c-colony").value;
  const city = document.getElementById("c-city").value;
  const state = document.getElementById("c-state").value;
  const postal = document.getElementById("c-postal").value;
  const reference = document.getElementById("c-ref").value;

  if(!name || !phoneClient || !address){
    alert("Completa los datos obligatorios");
    return;
  }

  let message = "Hola, quiero pedir:%0A%0A";
  let total = 0;

  cart.forEach(p=>{

    const subtotal = p.price * p.qty;
    total += subtotal;

    message += `• ${p.name}%0A`;

    if(p.color){
      message += `Color: ${p.color}%0A`;
    }

    if(p.size){
      message += `Talla: ${p.size}%0A`;
    }

    message += `Cantidad: ${p.qty}%0A`;
    message += `Subtotal: $${subtotal}%0A%0A`;

  });

  message += `TOTAL: $${total}%0A%0A`;

  message += `DATOS DE ENVÍO%0A`;
  message += `Nombre: ${name}%0A`;
  message += `Teléfono: ${phoneClient}%0A`;
  message += `Dirección: ${address}%0A`;
  message += `Colonia: ${colony}%0A`;
  message += `Ciudad: ${city}%0A`;
  message += `Estado: ${state}%0A`;
  message += `CP: ${postal}%0A`;

  if(reference){
    message += `Referencia: ${reference}%0A`;
  }

  const whatsapp = window.store?.whatsapp;

  if(!whatsapp){
    alert("Número de WhatsApp no configurado.");
    return;
  }

  const phone = String(whatsapp).replace(/\D/g,"");

  const url = `https://wa.me/${phone}?text=${message}`;

  window.open(url,"_blank");

}


/* =======================
INIT
======================= */

document.addEventListener("DOMContentLoaded",updateCartCount);

window.openCart = openCart;
window.closeCart = closeCart;
window.removeItem = removeItem;
window.checkout = checkout;
window.closeCheckout = closeCheckout;
window.sendCheckout = sendCheckout;