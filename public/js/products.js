import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";


// ================================
// GET QUERY PARAM
// ================================

function getQueryParam(param){

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get(param);

}

function getProductUrl(product){

  const params =
    new URLSearchParams();

  params.set("id", product.id);

  const slug =
    getQueryParam("slug") ||
    getQueryParam("store");

  if(slug){
    params.set("slug", slug);
  }

  return `/product.html?${params.toString()}`;

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
    padding:20px;
  `;

  modal.innerHTML = `

    <img
      src="${image}"
      style="
        max-width:95%;
        max-height:95%;
        object-fit:contain;
        border-radius:14px;
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
        featured.length
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

          if(!p.category)
            return false;

          return String(p.category)
            .toLowerCase()
            .trim() ===
            categoryFilter
              .toLowerCase()
              .trim();

        });

    }

    // ================================
    // EMPTY CATEGORY
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

      card.tabIndex = 0;
      card.setAttribute("role", "link");

      let imageUrl =
        product.image ||
        product.images?.[0]?.image_url ||
        "/assets/images/default.jpg";

      const price =
        Number(
          product.price || 0
        ).toLocaleString();

      // ================================
      // CARD HTML
      // ================================

      card.innerHTML = `

        <div class="product-image">

          <img
            src="${imageUrl}"
            alt="${product.name}"
            loading="lazy"
            onerror="
              this.src='/assets/images/default.jpg'
            "
          >

        </div>

        <div class="product-info">

          <div class="product-title">
            ${product.name || "Producto"}
          </div>

          <div class="product-price">
            $${price}
          </div>

          <button class="product-btn add-cart">
            Añadir
          </button>

        </div>

      `;

      container.appendChild(card);

      // ================================
      // OPEN PRODUCT DETAIL
      // ================================

      card.addEventListener(
        "click",
        () => {
          window.location.href = getProductUrl(product);
        }
      );

      card.addEventListener(
        "keydown",
        event => {
          if(event.key === "Enter"){
            window.location.href = getProductUrl(product);
          }
        }
      );

      // ================================
      // ADD TO CART
      // ================================

      const btn =
        card.querySelector(".add-cart");

      btn.addEventListener(
        "click",
        event => {

          event.stopPropagation();

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
                        padding:12px;
                        margin-bottom:12px;
                        border:1px solid #2b2b2b;
                        background:#111;
                        color:white;
                        border-radius:14px;
                        cursor:pointer;
                      "
                    >

                      <img
                        src="${variantImage}"
                        style="
                          width:65px;
                          height:65px;
                          object-fit:cover;
                          border-radius:10px;
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
                          "
                        >
                          ${v.size.toUpperCase()}
                        </div>

                        <div
                          style="
                            opacity:.7;
                            font-size:14px;
                          "
                        >
                          ${v.color}
                        </div>

                        <div
                          style="
                            margin-top:5px;
                            font-size:17px;
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
              background:rgba(0,0,0,.82);
              display:flex;
              align-items:center;
              justify-content:center;
              z-index:99999;
              padding:20px;
            `;

            modal.innerHTML = `

              <div style="
                background:#090909;
                border-radius:18px;
                width:100%;
                max-width:420px;
                padding:24px;
                color:white;
                border:1px solid #1f1f1f;
              ">

                <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  margin-bottom:20px;
                ">

                  <div>

                    <div style="
                      font-size:24px;
                      font-weight:800;
                    ">
                      ${product.name}
                    </div>

                    <div style="
                      opacity:.6;
                      margin-top:3px;
                    ">
                      Selecciona variante
                    </div>

                  </div>

                  <button
                    id="closeVariantModal"
                    style="
                      background:none;
                      border:none;
                      color:white;
                      font-size:28px;
                      cursor:pointer;
                    "
                  >
                    ×
                  </button>

                </div>

                <div style="
                  max-height:420px;
                  overflow:auto;
                ">
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

  id: product.id,

  variant_id: Number(variant.id),

  color: variant.color,

  size: variant.size,

  name:
    `${product.name} - ${variant.size.toUpperCase()} - ${variant.color}`,

  price:
    Number(
      variant.price ||
      product.price
    ),

  image:
    variantImage,

  qty: 1

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
      <div class="text-center p-10 text-red-500">
        Error cargando productos
      </div>
    `;

  }

}
