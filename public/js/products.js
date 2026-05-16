import { getProducts } from "./api.js";
import { addToCart } from "./cart.js";


// ================================
// GET QUERY PARAM
// ================================

function getQueryParam(param){

  const params = new URLSearchParams(window.location.search);

  return params.get(param);

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

        <div class="product-image">

          <img
            src="${imageUrl}"
            alt="${product.name}"
            loading="lazy"
            onerror="this.src='/assets/images/default.jpg'"
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
      // IMAGE CLICK
      // ================================

      const img =
        card.querySelector("img");

      img.addEventListener(
        "click",
        (e) => {

          e.stopPropagation();

          if(
            product.images &&
            product.images.length > 0 &&
            typeof openImageGallery === "function"
          ){

            openImageGallery(
              product.images
            );

          }else if(
            typeof openImageZoom === "function"
          ){

            openImageZoom(
              img.src
            );

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

                  return `
                    <button
                      class="variant-option"
                      data-index="${index}"
                      style="
                        padding:10px;
                        margin:5px;
                        border:1px solid #fff;
                        background:black;
                        color:white;
                        cursor:pointer;
                        width:100%;
                      "
                    >
                      ${v.size.toUpperCase()}
                      -
                      ${v.color}
                    </button>
                  `;

                })
                .join("");

            const modal =
              document.createElement("div");

            modal.style = `
              position:fixed;
              top:0;
              left:0;
              width:100%;
              height:100%;
              background:rgba(0,0,0,.85);
              display:flex;
              align-items:center;
              justify-content:center;
              z-index:99999;
            `;

            modal.innerHTML = `

              <div style="
                background:#111;
                padding:30px;
                border-radius:12px;
                color:white;
                min-width:320px;
                max-width:90%;
              ">

                <h2 style="
                  margin-bottom:20px;
                  font-size:22px;
                ">
                  Selecciona talla
                </h2>

                <div
                  class="variants-container"
                >
                  ${options}
                </div>

                <button
                  id="closeVariantModal"
                  style="
                    margin-top:20px;
                    padding:12px;
                    width:100%;
                    background:white;
                    color:black;
                    border:none;
                    cursor:pointer;
                    border-radius:8px;
                  "
                >
                  Cerrar
                </button>

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
                        imageUrl,

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
    <div class="text-center p-10 text-red-500">
      Error cargando productos
    </div>
    `;

  }

}