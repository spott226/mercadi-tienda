import { getProducts } from "./api.js";
import { loadProducts } from "./products.js";

const DEFAULT_PRESETS = {
  ecommerce_default: [
    { type: "product_grid" }
  ],
  fashion_editorial_1: [
    { type: "category_tiles", title: "Comprar por categoria" },
    { type: "editorial_banner", title: "Nueva seleccion", text: "Piezas elegidas para elevar tu estilo diario." },
    { type: "product_grid", title: "Nuevos productos" }
  ],
  fashion_editorial_2: [
    { type: "image_banner", title: "Temporada actual", text: "Silhuetas limpias, materiales suaves y detalles sutiles." },
    { type: "product_grid", title: "Lo mas reciente" },
    { type: "category_tiles", title: "Explora colecciones" }
  ],
  streetwear_drop_1: [
    { type: "promo_strip", title: "Drop activo", text: "Disponibilidad limitada." },
    { type: "product_grid", title: "Drop actual" },
    { type: "image_banner", title: "Estilo urbano", text: "Prendas para moverse distinto." }
  ],
  gym_active_1: [
    { type: "category_tiles", title: "Compra por entrenamiento" },
    { type: "product_grid", title: "Favoritos para entrenar" },
    { type: "editorial_banner", title: "Construido para moverte", text: "Ropa funcional para todos los dias." }
  ],
  luxury_minimal_1: [
    { type: "editorial_banner", title: "Menos ruido. Mas presencia.", text: "Una seleccion sobria para vestir mejor." },
    { type: "product_grid", title: "Seleccion destacada" }
  ],
  boutique_grid_1: [
    { type: "category_tiles", title: "Categorias" },
    { type: "product_grid", title: "Catalogo" }
  ],
  lookbook_1: [
    { type: "image_banner", title: "Lookbook", text: "Inspiracion visual para combinar tus prendas." },
    { type: "product_grid", title: "Compra el look" }
  ],
  promo_stack_1: [
    { type: "promo_strip", title: "Promociones activas", text: "Revisa piezas seleccionadas antes de que se agoten." },
    { type: "product_grid", title: "Productos en tendencia" },
    { type: "category_tiles", title: "Tambien puedes explorar" }
  ],
  mobile_first_1: [
    { type: "product_grid", title: "Compra rapido" },
    { type: "image_banner", title: "Desde Instagram hasta tu carrito", text: "Una experiencia rapida y directa." }
  ]
};

class EcommerceTemplate{
  constructor({ store, slug }){
    this.store = store;
    this.slug = slug;
    this.products = [];
  }

  applyShell(){
    document.body.classList.add(
      "storefront-ecommerce",
      `template-${this.getTemplateKey()}`
    );

    setText("storefront-featured-title","Productos destacados");
    setText("storefront-primary-link","Productos");
    setText("storefront-category-link","Categorías");
    setText("storefront-hero-cta","Ver catálogo");
  }

  getTemplateKey(){
    return this.store?.template_key || "ecommerce_default";
  }

  getSections(){
    if(
      Array.isArray(this.store?.homepage_sections) &&
      this.store.homepage_sections.length > 0
    ){
      return this.store.homepage_sections;
    }

    return (
      DEFAULT_PRESETS[this.getTemplateKey()] ||
      DEFAULT_PRESETS.ecommerce_default
    );
  }

  async render(){
    this.applyShell();
    clearDynamicSections();

    this.products =
      await getProducts(this.slug);

    await loadProducts(this.slug);

    renderSections({
      store: this.store,
      slug: this.slug,
      products: this.products,
      sections: this.getSections()
    });
  }
}

class RestaurantTemplateOne extends EcommerceTemplate{
  applyShell(){
    document.body.classList.add(
      "storefront-restaurant",
      "template-restaurant-1"
    );

    setText("storefront-featured-title","Especialidades");
    setText("storefront-primary-link","Menú");
    setText("storefront-category-link","Categorías");
    setText("storefront-hero-cta","Ver menú");
  }
}

class RestaurantTemplateTwo extends EcommerceTemplate{
  applyShell(){
    document.body.classList.add(
      "storefront-restaurant",
      "template-restaurant-2"
    );

    setText("storefront-featured-title","Recomendaciones");
    setText("storefront-primary-link","Menú");
    setText("storefront-category-link","Categorías");
    setText("storefront-hero-cta","Ordenar ahora");
  }
}

class AppointmentsTemplateOne extends EcommerceTemplate{
  applyShell(){
    document.body.classList.add(
      "storefront-appointments",
      "template-appointments-1"
    );

    setText("storefront-featured-title","Servicios destacados");
    setText("storefront-primary-link","Servicios");
    setText("storefront-category-link","Categorías");
    setText("storefront-hero-cta","Ver servicios");
  }
}

function setText(id,text){
  const element =
    document.getElementById(id);

  if(element){
    element.textContent = text;
  }
}

function clearStorefrontClasses(){
  document.body.className =
    document.body.className
      .split(" ")
      .filter(className =>
        !className.startsWith("storefront-") &&
        !className.startsWith("template-")
      )
      .join(" ");
}

function clearDynamicSections(){
  document
    .querySelectorAll(".storefront-dynamic-section")
    .forEach(section => section.remove());
}

function getInsertionPoint(){
  const products =
    document.getElementById("products");

  return products?.closest("section") || null;
}

function getCategoryUrl(slug, category){
  const params = new URLSearchParams();

  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1";

  if(isLocal && slug){
    params.set("slug", slug);
  }

  params.set("category", category);

  return `/products.html?${params.toString()}`;
}

function getCategories(products){
  return [
    ...new Set(
      products
        .map(product => product.category)
        .filter(Boolean)
        .map(category => String(category).trim())
        .filter(Boolean)
    )
  ];
}

function createSection(className){
  const section = document.createElement("section");
  section.className =
    `storefront-dynamic-section ${className}`;
  return section;
}

function renderSections({ store, slug, products, sections }){
  const insertionPoint = getInsertionPoint();

  if(!insertionPoint){
    return;
  }

  let anchor = insertionPoint;

  sections
    .filter(section => section.type !== "product_grid")
    .forEach(sectionConfig => {
      const section = renderSection({
        sectionConfig,
        store,
        slug,
        products
      });

      if(section){
        anchor.insertAdjacentElement("afterend", section);
        anchor = section;
      }
    });

  const productSection =
    sections.find(section => section.type === "product_grid");

  if(productSection?.title){
    setText("storefront-featured-title", productSection.title);
  }
}

function renderSection({ sectionConfig, store, slug, products }){
  if(sectionConfig.type === "category_tiles"){
    return renderCategoryTiles({
      sectionConfig,
      slug,
      products
    });
  }

  if(sectionConfig.type === "image_banner"){
    return renderImageBanner({
      sectionConfig,
      store
    });
  }

  if(sectionConfig.type === "editorial_banner"){
    return renderEditorialBanner(sectionConfig);
  }

  if(sectionConfig.type === "promo_strip"){
    return renderPromoStrip(sectionConfig);
  }

  return null;
}

function renderCategoryTiles({ sectionConfig, slug, products }){
  const categories = getCategories(products).slice(0, 6);

  if(categories.length === 0){
    return null;
  }

  const section = createSection("storefront-category-tiles");
  section.innerHTML = `
    <div class="storefront-section-inner">
      <div class="storefront-section-heading">
        ${sectionConfig.title || "Categorias"}
      </div>
      <div class="storefront-category-grid">
        ${categories.map(category => `
          <a href="${getCategoryUrl(slug, category)}">
            <span>${category}</span>
          </a>
        `).join("")}
      </div>
    </div>
  `;

  return section;
}

function renderImageBanner({ sectionConfig, store }){
  const image =
    sectionConfig.image_url ||
    sectionConfig.image ||
    store?.hero;

  const section = createSection("storefront-image-banner");
  section.innerHTML = `
    ${image ? `<img src="${image}" loading="lazy" alt="">` : ""}
    <div>
      <p>${sectionConfig.kicker || ""}</p>
      <h2>${sectionConfig.title || store?.name || ""}</h2>
      <span>${sectionConfig.text || sectionConfig.description || ""}</span>
    </div>
  `;

  return section;
}

function renderEditorialBanner(sectionConfig){
  const section = createSection("storefront-editorial-banner");
  section.innerHTML = `
    <div>
      <p>${sectionConfig.kicker || "Editorial"}</p>
      <h2>${sectionConfig.title || ""}</h2>
    </div>
    <p>${sectionConfig.text || sectionConfig.description || ""}</p>
  `;

  return section;
}

function renderPromoStrip(sectionConfig){
  const section = createSection("storefront-promo-strip");
  section.innerHTML = `
    <strong>${sectionConfig.title || ""}</strong>
    <span>${sectionConfig.text || sectionConfig.description || ""}</span>
  `;

  return section;
}

export async function renderStorefrontExperience({ store, slug }){

  clearStorefrontClasses();

  const businessType =
    store?.business_type || "ecommerce";

  const templateKey =
    store?.template_key || "ecommerce_default";

  let template;

  if(
    businessType === "restaurant" &&
    templateKey === "restaurant_1"
  ){
    template = new RestaurantTemplateOne({ store, slug });
  }else if(
    businessType === "restaurant" &&
    templateKey === "restaurant_2"
  ){
    template = new RestaurantTemplateTwo({ store, slug });
  }else if(
    businessType === "appointments" &&
    templateKey === "appointments_1"
  ){
    template = new AppointmentsTemplateOne({ store, slug });
  }else{
    template = new EcommerceTemplate({ store, slug });
  }

  await template.render();

}
