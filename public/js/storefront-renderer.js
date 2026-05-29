import { loadProducts } from "./products.js";

class EcommerceTemplate{
  constructor({ slug }){
    this.slug = slug;
  }

  async render(){
    await loadProducts(this.slug);
  }
}

class RestaurantTemplateOne extends EcommerceTemplate{}

class RestaurantTemplateTwo extends EcommerceTemplate{}

class AppointmentsTemplateOne extends EcommerceTemplate{}

export async function renderStorefrontExperience({ store, slug }){

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
