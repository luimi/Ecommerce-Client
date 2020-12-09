import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import Parse from 'parse';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = [];
  public cartTotal = 0;

  constructor(private utils: UtilsService) {
    this.getCartProducts();
  }
  public countCartProducts() {
    return this.cart.length;
  }
  public addCartProduct(product, qty?) {
    if (!this.isCartProduct(product.id)) {
      this.cart.push({ id: product.id, qty: (qty ? qty : "1" ), p: product});
    }
    this.updateCartTotal();
    this.updateCart();
    
  }
  public isCartProduct(id) {
    return this.cart
      .map((o) => {
        return o.id;
      })
      .includes(id);
  }
  public async getCartProducts() {
    //TODO Caso cuando el producto se elimine
    const cart = this.utils.getStoredArray("cart");
    const objects = cart.map((o) => {
      return this.utils.parseGenericObjectWithId("ECommerceProduct",o.id);
    });
    const products = await Parse.Object.fetchAllIfNeeded(objects);
    products.forEach((product) => {
      cart.forEach((cartProduct) => {
        if (product.id === cartProduct.id) {
          cartProduct.p = product;
        }
      });
    });
    this.cart = cart;
    this.updateCartTotal();
    
  }
  public removeCartProduct(id) {
    let index = this.getCartIndex(id);
    this.cart.splice(index, 1);
    this.updateCartTotal();
    this.updateCart();
  }
  public updateCartTotal() {
    let total = 0;
    this.cart.forEach(o => {
      total += (o.p.get('price') - (o.p.get('isDiscount') ? (o.p.get('price') * (o.p.get('discountPercentage') / 100)) : 0)) * parseInt(o.qty);
    });
    this.cartTotal = total;
  }
  public setCartProductQuantity(id, qty) {
    let index = this.getCartIndex(id);
    if (this.cart.length > 0) {
      this.cart[index].qty = qty;
    }
    this.cart[index].qty = qty;
    this.updateCartTotal();
    this.updateCart();
  }
  public clearCart() {
    this.cart = [];
    this.updateCartTotal();
    this.updateCart();
  }
  public getCartIndex(id) {
    let index = 0;
    for (let i = 0; i < this.cart.length; i++) {
      if (this.cart[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }
  public async createCartDelivery(address, callback) {
    const Delivery = Parse.Object.extend("ECommerceDelivery");
    let delivery = new Delivery();
    delivery.set('user', Parse.User.current());
    delivery.set('products', this.utils.getStoredArray("cart"));
    delivery.set('address', address);
    delivery.set('status', 1);
    const ACL = await this.utils.getACL();
    delivery.setACL(ACL);
    delivery = await delivery.save();
    this.clearCart();
    if(callback){
      callback(delivery);
    }
  }
  public getCartProductQty(id) {
    let index = this.getCartIndex(id);
    return this.cart[index].qty;
  }
  public updateCart(){
    let cart = [];
    this.cart.forEach(product => {
      cart.push({id: product.id, qty:product.qty});
    });
    this.utils.setStoredArray("cart",cart);
  }
}
