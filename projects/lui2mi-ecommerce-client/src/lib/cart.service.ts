import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import Parse from 'parse';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = [];
  public cartProducts = [];
  public cartTotal = 0;

  constructor(private utils: UtilsService) { }
  

  public countCartProducts() {
    return this.cart.length;
  }
  public addCartProduct(product, qty?) {
    if (!this.isCartProduct(product.id)) {
      this.cart.push({ id: product.id, qty: qty ? qty : "1" });
    }
    this.utils.setStoredArray("cart", this.cart);
    this.cart = this.utils.getStoredArray("cart");
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
      const Product = Parse.Object.extend("ECommerceProduct");
      const product = new Product();
      product.id = o.id;
      return product;
    });
    const products = await Parse.Object.fetchAllIfNeeded(objects);
    products.forEach((product) => {
      cart.forEach((cartProduct) => {
        if (product.id === cartProduct.id) {
          cartProduct.product = product;
        }
      });
    });
    this.cartProducts = cart;
    this.updateCartTotal();
  }
  public removeCartProduct(id) {
    this.cartProducts.forEach((product, index) => {
      if (product.id === id) {
        this.cartProducts.splice(index, 1);
        this.cart.splice(index, 1);
        this.utils.setStoredArray("cart", this.cart);
      }
    });
    this.updateCartTotal();
  }
  public updateCartTotal() {
    let total = 0;
    this.cartProducts.forEach(o => {
      total += (o.product.get('price') - (o.product.get('isDiscount') ? (o.product.get('price') * (o.product.get('discountPercentage') / 100)) : 0)) * parseInt(o.qty);
    });
    this.cartTotal = total;
  }
  public setCartProductQuantity(id, qty) {
    this.cartProducts.forEach((product, index) => {
      if (product.id === id) {
        product.qty = qty;
        this.cart[index].qty = qty;
        this.utils.setStoredArray("cart", this.cart);
      }
    });
  }
  public clearCart() {
    this.utils.setStoredArray('cart', []);
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
  public async createCartDelivey(address, callback) {
    const Delivery = Parse.Object.extend("ECommerceDelivery");
      let delivery = new Delivery();
      delivery.set('user', Parse.User.current());
      delivery.set('products', this.utils.getStoredArray("cart"));
      delivery.set('address', address);
      delivery.set('status', 1);
      const adminRole = await this.utils.getAdminRole();
      delivery.setACL(this.utils.ACLPublicRead(adminRole));
      await delivery.save();
  }
}
