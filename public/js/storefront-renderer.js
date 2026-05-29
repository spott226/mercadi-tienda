import { loadProducts } from "./products.js";

class EcommerceTemplate{
  constructor({ store, slug }){
    this.store = store;
    this.slug = slug;
  }

  applyShell(){
    document.body.classList.add(
      "storefront-ecommerce",
      "template-ecommerce-default"
    );

    setText("storefront-featured-title","Productos destacados");
    setText("storefront-primary-link","Productos");
    setText("storefront-category-link","Categorías");
    setText("storefront-hero-cta","Ver catálogo");
  }

  async render(){
    this.applyShell();
    await loadProducts(this.slug);
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
  document.body.classList.remove(
    "storefront-ecommerce",
    "storefront-restaurant",
    "storefront-appointments",
    "template-ecommerce-default",
    "template-restaurant-1",
    "template-restaurant-2",
    "template-appointments-1"
  );
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
