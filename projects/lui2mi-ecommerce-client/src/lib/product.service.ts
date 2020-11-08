import { Injectable } from '@angular/core';
import Parse from 'parse';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  public promoProductQuery = new Parse.Query("ECommerceProduct")
  .equalTo("isDiscount", true)
  .limit(5);
  public mainProductQuery = new Parse.Query("ECommerceProduct")
  .limit(5);

  constructor() { }

  public async getProduct(id) {
    return await new Parse.Query('ECommerceProduct').get(id);
  }
}
