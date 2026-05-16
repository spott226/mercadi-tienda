import { createOrder } from "./api.js";

const CART_KEY = "mercadia_cart";

function getCart(){

  const cart =
    localStorage.getItem(CART_KEY);

  return cart
    ? JSON.parse(cart)
    : [];

}

function saveCart(cart){

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

}


/* =======================
AGREGAR AL CARRITO
======================= */

export function addToCart(product){

  const cart = getCart();

  const existing = cart.find(
    p =>
      p.id === product.id &&
      p.color === product.color &&
      p.size === product.size
  );

  if(existing){

    existing.qty += 1;

  }else{

    cart.push({

      id:
        product.id,

      variant_id:
        product.variant_id || null,

      name:
        product.name,

      price:
        Number(product.price),

      qty:
        product.qty || 1,

      color:
        product.color || null,

      size:
        product.size || null,

      image:
        product.image || null

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

  const counter =
    document.getElementById(
      "cart-count"
    );

  if(!counter) return;

  const totalItems =
    cart.reduce(
      (acc,item)=>
        acc + item.qty,
      0
    );

  counter.textContent =
    totalItems;

}


/* =======================
MOSTRAR CARRITO
======================= */

export function openCart(){

  const cart = getCart();

  const container =
    document.getElementById(
      "cart-items"
    );

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

    const subtotal =
      p.price * p.qty;

    total += subtotal;

    container.innerHTML += `

      <div
        class="flex gap-3 border-b py-4"
      >

        <img
          src="${
            p.image ||
            "/assets/images/default.jpg"
          }"
          style="
            width:70px;
            height:70px;
            object-fit:cover;
            border-radius:10px;
          "
        >

        <div class="flex-1">

          <p class="font-semibold">
            ${p.name}
          </p>

          <p class="text-sm opacity-70">

            ${
              p.color
              ? `Color: ${p.color}<br>`
              : ""
            }

            ${
              p.size
              ? `Talla: ${p.size}<br>`
              : ""
            }

            $${p.price} x ${p.qty}

          </p>

        </div>

        <div class="text-right">

          <p class="font-bold">
            $${subtotal}
          </p>

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

  const totalElement =
    document.getElementById(
      "cart-total"
    );

  if(totalElement){

    totalElement.innerText =
      "$" + total;

  }

  const modal =
    document.getElementById(
      "cart-modal"
    );

  if(modal){

    modal.classList.remove(
      "hidden"
    );

  }

}


/* =======================
CERRAR CARRITO
======================= */

export function closeCart(){

  const modal =
    document.getElementById(
      "cart-modal"
    );

  if(modal){

    modal.classList.add(
      "hidden"
    );

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
ABRIR CHECKOUT
======================= */

export function checkout(){

  const cart = getCart();

  if(cart.length === 0){

    alert("Carrito vacío");

    return;

  }

  const modal =
    document.getElementById(
      "checkout-modal"
    );

  if(modal){

    modal.classList.remove(
      "hidden"
    );

  }

}


/* =======================
CERRAR CHECKOUT
======================= */

export function closeCheckout(){

  const modal =
    document.getElementById(
      "checkout-modal"
    );

  if(modal){

    modal.classList.add(
      "hidden"
    );

  }

}


/* =======================
ENVIAR PEDIDO ERP
======================= */

export async function sendCheckout(){

  try {

    const cart = getCart();

    const name =
      document.getElementById(
        "c-name"
      ).value.trim();

    const phoneClient =
      document.getElementById(
        "c-phone"
      ).value.trim();

    const address =
      document.getElementById(
        "c-address"
      ).value.trim();

    const colony =
      document.getElementById(
        "c-colony"
      ).value.trim();

    const city =
      document.getElementById(
        "c-city"
      ).value.trim();

    const state =
      document.getElementById(
        "c-state"
      ).value.trim();

    const postal =
      document.getElementById(
        "c-postal"
      ).value.trim();

    const reference =
      document.getElementById(
        "c-ref"
      ).value.trim();

    if(
      !name ||
      !phoneClient ||
      !address
    ){

      alert(
        "Completa los datos obligatorios"
      );

      return;

    }

    /* =======================
    ITEMS ERP
    ======================= */

    const items =
      cart.map(p => ({

        variant_id:
          p.variant_id,

        quantity:
          p.qty

      }));

    console.log(
      "ITEMS ERP:",
      items
    );


    /* =======================
    CREAR PEDIDO ERP
    ======================= */

    const data =
      await createOrder({

        store_id:
          window.store?.id,

        customer_name:
          name,

        customer_phone:
          phoneClient,

        customer_address:
          `${address}, ${colony}, ${city}, ${state}, ${postal}`,

        items

      });

    if(
      !data ||
      !data.success
    ){

      alert(
        "Error creando pedido"
      );

      return;

    }


    /* =======================
    MENSAJE WHATSAPP
    ======================= */

    const storeName =
      window.store?.name ||
      "la tienda";

    let message = `
🛒 NUEVO PEDIDO - ${storeName}

━━━━━━━━━━━━━━━

📦 PRODUCTOS
`;

    let total = 0;

    cart.forEach(p => {

      const subtotal =
        p.price * p.qty;

      total += subtotal;

      message += `

• ${p.name}

${p.color ? `🎨 Color: ${p.color}` : ""}
${p.size ? `📏 Talla: ${p.size}` : ""}

🔢 Cantidad: ${p.qty}
💵 Precio: $${p.price}
🧾 Subtotal: $${subtotal}

`;

    });

    message += `
━━━━━━━━━━━━━━━

💰 TOTAL: $${total}

🆔 Pedido ERP: #${data.order_id}

━━━━━━━━━━━━━━━

🚚 DATOS DE ENVÍO

👤 Nombre:
${name}

📱 Teléfono:
${phoneClient}

📍 Dirección:
${address}

🏘️ Colonia:
${colony}

🌆 Ciudad:
${city}

🗺️ Estado:
${state}

📮 Código Postal:
${postal}
`;

    if(reference){

      message += `

📝 Referencia:
${reference}
`;

    }

    message += `

━━━━━━━━━━━━━━━

Gracias por tu compra 🙌
`;



    /* =======================
    WHATSAPP
    ======================= */

    const whatsapp =
      window.store?.whatsapp;

    if(!whatsapp){

      alert(
        "Número de WhatsApp no configurado."
      );

      return;

    }

    const phone =
      String(whatsapp)
      .replace(/\D/g,"");

    const encodedMessage =
      encodeURIComponent(message);

    const url =
      `https://wa.me/${phone}?text=${encodedMessage}`;


    /* =======================
    LIMPIAR CARRITO
    ======================= */

    localStorage.removeItem(
      CART_KEY
    );

    updateCartCount();

    closeCheckout();

    closeCart();


    /* =======================
    ABRIR WHATSAPP
    ======================= */

    window.open(
      url,
      "_blank"
    );

  } catch(err){

    console.error(err);

    alert(
      "Error procesando pedido"
    );

  }

}


/* =======================
INIT
======================= */

document.addEventListener(
  "DOMContentLoaded",
  updateCartCount
);

window.openCart =
  openCart;

window.closeCart =
  closeCart;

window.removeItem =
  removeItem;

window.checkout =
  checkout;

window.closeCheckout =
  closeCheckout;

window.sendCheckout =
  sendCheckout;