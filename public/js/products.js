import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";


// ================================
// GET QUERY PARAM
// ================================

function getQueryParam(param){

  const params = new URLSearchParams(
    window.location.search
  );

  return params.get(param);

}


// ================================
// IMAGE ZOOM
// ================================

function openImageZoom(image){

  const modal =
    document.createElement("div");

  modal.style = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.92);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:999999;
    cursor:zoom-out;
    padding:30px;
  `;

  modal.innerHTML = `

    <img
      src="${image}"
      style="
        max-width:95%;
        max-height:95%;
        object-fit:contain;
        border-radius:14px;
        box-shadow:0 0 40px rgba(255,255,255,.12);
      "
    >

  `;

  modal.addEventListener(
    "click",
    () => modal.remove()
  );

  document.body.appendChild(modal);

}


// ================================
// LOAD PRODUCTS
// ================================

export async function loadProducts(slug){

  const featuredContainer =
    document.getElementById("products");

  const allContainer =
    document.getElementById("products-list");

  const container =
    featuredContainer || allContainer;

  if(!container) return;

  container.innerHTML =
    "Cargando productos...";

  try{

    // ================================
    // GET PRODUCTS
    // ================================

    const products =
      await getProducts(slug);

    console.log(
      "PRODUCTS:",
      products
    );

    if(
      !products ||
      products.length === 0
    ){

      container.innerHTML = `
      <div class="text-center p-10 opacity-60">
        No hay productos disponibles
      </div>
      `;

      return;

    }

    container.innerHTML = "";

    let productsToShow = products;

    // ================================
    // FEATURED
    // ================================

    if(featuredContainer){

      const featured =
        products.filter(
          p => p.featured === true
        );

      productsToShow =
        featured.length > 0
          ? featured
          : products.slice(0,4);

    }

    // ================================
    // CATEGORY FILTER
    // ================================

    const categoryFilter =
      getQueryParam("category");

    if(categoryFilter){

      productsToShow =
        products.filter(p => {

          if(!p.category) return false;

          return String(p.category)
            .toLowerCase()
            .trim() ===
            categoryFilter
              .toLowerCase()
              .trim();

        });

    }

    // ================================
    // EMPTY
    // ================================

    if(productsToShow.length === 0){

      container.innerHTML = `
      <div class="text-center p-10 opacity-60">
        No hay productos en esta categoría
      </div>
      `;

      return;

    }

    // ================================
    // RENDER PRODUCTS
    // ================================

    productsToShow.forEach(product => {

      const card =
        document.createElement("div");

      card.className =
        "product-card";

      card.style = `
        background:#0f0f0f;
        border-radius:18px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.08);
        transition:.25s;
        box-shadow:0 10px 30px rgba(0,0,0,.35);
      `;

      // ================================
      // IMAGE
      // ================================

      let imageUrl =
        product.image ||
        product.images?.[0]?.image_url ||
        "/assets/images/default.jpg";

      // ================================
      // PRICE
      // ================================

      const price =
        Number(
          product.price || 0
        ).toLocaleString();

      // ================================
      // CARD HTML
      // ================================

      card.innerHTML = `

        <div
          class="product-image"
          style="
            height:340px;
            overflow:hidden;
            background:#111;
            cursor:zoom-in;
          "
        >

          <img
            src="${imageUrl}"
            alt="${product.name}"
            loading="lazy"
            style="
              width:100%;
              height:100%;
              object-fit:cover;
              transition:.35s;
            "
            onmouseover="
              this.style.transform='scale(1.06)'
            "
            onmouseout="
              this.style.transform='scale(1)'
            "
            onerror="
              this.src='/assets/images/default.jpg'
            "
          >

        </div>

        <div
          class="product-info"
          style="
            padding:18px;
          "
        >

          <div
            class="product-title"
            style="
              font-size:22px;
              font-weight:700;
              margin-bottom:10px;
              color:white;
            "
          >
            ${product.name || "Producto"}
          </div>

          <div
            class="product-price"
            style="
              font-size:28px;
              font-weight:800;
              color:white;
              margin-bottom:18px;
            "
          >
            $${price}
          </div>

          <button
            class="product-btn add-cart"
            style="
              width:100%;
              padding:14px;
              border:none;
              border-radius:12px;
              background:white;
              color:black;
              font-size:17px;
              font-weight:700;
              cursor:pointer;
              transition:.25s;
            "
          >
            Añadir
          </button>

        </div>

      `;

      container.appendChild(card);

      // ================================
      // IMAGE CLICK ZOOM
      // ================================

      const img =
        card.querySelector("img");

      img.addEventListener(
        "click",
        () => {

          openImageZoom(img.src);

        }
      );

      // ================================
      // ADD TO CART
      // ================================

      const btn =
        card.querySelector(".add-cart");

      btn.addEventListener(
        "click",
        () => {

          console.log(
            "PRODUCT CLICK:",
            product
          );

          console.log(
            "VARIANTS:",
            product.variants
          );

          // ================================
          // HAS VARIANTS
          // ================================

          if(
            product.variants &&
            product.variants.length > 0
          ){

            const options =
              product.variants
                .map((v, index) => {

                  const variantImage =

                    product.images?.find(
                      img =>
                        img.color?.toLowerCase()
                        ===
                        v.color?.toLowerCase()
                    )?.image_url ||

                    imageUrl;

                  return `

                    <button
                      class="variant-option"
                      data-index="${index}"
                      style="
                        width:100%;
                        display:flex;
                        align-items:center;
                        gap:14px;
                        padding:14px;
                        margin-bottom:12px;
                        border:1px solid rgba(255,255,255,.1);
                        background:#181818;
                        color:white;
                        border-radius:14px;
                        cursor:pointer;
                        transition:.25s;
                      "
                    >

                      <img
                        src="${variantImage}"
                        style="
                          width:70px;
                          height:70px;
                          object-fit:cover;
                          border-radius:12px;
                        "
                      >

                      <div
                        style="
                          text-align:left;
                        "
                      >

                        <div
                          style="
                            font-size:18px;
                            font-weight:700;
                            margin-bottom:5px;
                          "
                        >
                          ${v.size.toUpperCase()}
                        </div>

                        <div
                          style="
                            opacity:.7;
                            font-size:14px;
                            margin-bottom:4px;
                          "
                        >
                          ${v.color}
                        </div>

                        <div
                          style="
                            font-size:18px;
                            font-weight:700;
                          "
                        >
                          $${Number(
                            v.price ||
                            product.price
                          ).toLocaleString()}
                        </div>

                      </div>

                    </button>

                  `;

                })
                .join("");

            const modal =
              document.createElement("div");

            modal.style = `
              position:fixed;
              inset:0;
              background:rgba(0,0,0,.88);
              display:flex;
              align-items:center;
              justify-content:center;
              z-index:99999;
              padding:20px;
              backdrop-filter:blur(8px);
            `;

            modal.innerHTML = `

              <div style="
                background:#0f0f0f;
                border-radius:24px;
                width:100%;
                max-width:460px;
                padding:28px;
                border:1px solid rgba(255,255,255,.08);
                box-shadow:0 20px 60px rgba(0,0,0,.55);
                color:white;
              ">

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:24px;
                  "
                >

                  <div>

                    <div
                      style="
                        font-size:28px;
                        font-weight:800;
                        margin-bottom:5px;
                      "
                    >
                      ${product.name}
                    </div>

                    <div
                      style="
                        opacity:.6;
                      "
                    >
                      Selecciona talla
                    </div>

                  </div>

                  <button
                    id="closeVariantModal"
                    style="
                      background:none;
                      border:none;
                      color:white;
                      font-size:30px;
                      cursor:pointer;
                    "
                  >
                    ×
                  </button>

                </div>

                <div
                  class="variants-container"
                  style="
                    max-height:420px;
                    overflow:auto;
                  "
                >
                  ${options}
                </div>

              </div>

            `;

            document.body.appendChild(
              modal
            );

            // ================================
            // SELECT VARIANT
            // ================================

            document
              .querySelectorAll(
                ".variant-option"
              )
              .forEach(btnVariant => {

                btnVariant.addEventListener(
                  "click",
                  () => {

                    const index =
                      btnVariant.dataset.index;

                    const variant =
                      product.variants[index];

                    const variantImage =

                      product.images?.find(
                        img =>
                          img.color?.toLowerCase()
                          ===
                          variant.color?.toLowerCase()
                      )?.image_url ||

                      imageUrl;

                    const cartProduct = {

                      id:
                        product.id,

                      variantId:
                        variant.id,

                      name:
                        `${product.name} - ${variant.size.toUpperCase()} - ${variant.color}`,

                      price:
                        Number(
                          variant.price ||
                          product.price
                        ),

                      image:
                        variantImage,

                      quantity: 1

                    };

                    addToCart(
                      cartProduct
                    );

                    modal.remove();

                  }
                );

              });

            // ================================
            // CLOSE MODAL
            // ================================

            document
              .getElementById(
                "closeVariantModal"
              )
              .addEventListener(
                "click",
                () => {

                  modal.remove();

                }
              );

            return;

          }

          // ================================
          // NORMAL PRODUCT
          // ================================

          const cartProduct = {

            id:
              product.id,

            name:
              product.name,

            price:
              Number(
                product.price
              ),

            image:
              imageUrl,

            quantity: 1

          };

          addToCart(
            cartProduct
          );

        }
      );

    });

  }catch(error){

    console.error(
      "Error cargando productos:",
      error
    );

    container.innerHTML = `
    <div
      class="text-center p-10 text-red-500"
    >
      Error cargando productos
    </div>
    `;

  }

}