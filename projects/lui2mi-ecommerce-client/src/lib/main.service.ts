import { Injectable } from '@angular/core';
import Parse from 'parse';
import { ChatService } from './chat.service';
import { DeliveryService } from './delivery.service';
import { ProductService } from './product.service';
@Injectable({
  providedIn: 'root'
})
export class MainService {
  public mainPromos = [];
  public mainProducts = [];
  public mainDeliveries = [];
  private mainProductsCount = 0;

  constructor(private deliveryCtrl: DeliveryService, private productCtrl: ProductService, private chatCtrl: ChatService) { }

  public async getMainLists() {
    this.mainProductsCount = await this.productCtrl.mainProductQuery.count();
    this.mainPromos = await this.productCtrl.promoProductQuery.limit(this.productCtrl.config.promoLimit).find();
    this.mainProducts = await this.productCtrl.mainProductQuery.limit(this.productCtrl.config.mainLimit).find();
    this.mainDeliveries = await this.deliveryCtrl.deliveriesQuery.find();
    if(this.mainDeliveries.length>0){
      this.chatCtrl.getChatUnreadMessages();
    }
    this.deliveryCtrl.subscribeMainDelivery((delivery)=>{
      console.log('update');
    }, (delivery)=> {
      this.mainDeliveries.unshift(delivery);
    });
  }
  public async searchMainProducts(text) {
    if (text != "") {
      let tag = new Parse.Query('ECommerceProduct').contains('tag', text);
      let name = new Parse.Query('ECommerceProduct').contains('nameSearch', text);
      let result = await Parse.Query.or(tag, name).find();
      this.mainProducts = result;
      this.mainPromos = [];
    } else {
      this.getMainLists();
    }
  }
  public async getMoreProducts(complete, disable){
    if(this.mainProducts.length < this.mainProductsCount ){
      let result = await this.productCtrl.mainProductQuery.limit(this.productCtrl.config.mainLimit).skip(this.mainProducts.length).find();
      this.mainProducts = this.mainProducts.concat(result);
      complete();
      if(this.mainProducts.length === this.mainProductsCount){
        disable();
      }
    }
  }
}
