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

  constructor(private deliveryCtrl: DeliveryService, private productCtrl: ProductService, private chatCtrl: ChatService) { }

  public async getMainLists() {
    this.mainPromos = await this.productCtrl.promoProductQuery.find();
    this.mainProducts = await this.productCtrl.mainProductQuery.find();
    this.mainDeliveries = await this.deliveryCtrl.deliveriesQuery.find();
    if(this.mainDeliveries.length>0){
      this.chatCtrl.getChatUnreadMessages(this.mainDeliveries[0]);
    }
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
}
