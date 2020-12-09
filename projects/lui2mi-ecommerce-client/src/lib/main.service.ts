import { Injectable } from '@angular/core';
import Parse from 'parse';
import { ChatService } from './chat.service';
import { DeliveryService } from './delivery.service';
import { ProductService } from './product.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  public mainPromos = [];
  public mainProducts = [];
  public mainDeliveries = [];
  public isSearching = false;
  public mainProductsCount = 0;
  public mainDeliveriesSubscription;

  constructor(private deliveryCtrl: DeliveryService, private productCtrl: ProductService, private chatCtrl: ChatService, private utils: UtilsService) { }

  public async getMainLists() {
    this.mainProductsCount = await this.productCtrl.mainProductQuery.count();
    this.mainPromos = await this.productCtrl.promoProductQuery.limit(this.productCtrl.config.promoLimit).find();
    this.mainProducts = await this.productCtrl.mainProductQuery.limit(this.productCtrl.config.mainLimit).skip(0).find();
    this.getMainDeliveries();
  }
  public async getMainDeliveries() {
    if (this.utils.isLogedIn()) {
      this.mainDeliveries = await this.deliveryCtrl.mainDeliveriesQuery.find();
      if(!this.mainDeliveriesSubscription){
        this.mainDeliveriesSubscription = await this.deliveryCtrl.mainDeliveriesQuery.subscribe();
        this.mainDeliveriesSubscription.on('update',()=>{});
        this.mainDeliveriesSubscription.on('create',(delivery) => {
          this.mainDeliveries.unshift(delivery);
        });
      }
    }
  }
  private unsubscribeMainDelivery(){
    if(this.mainDeliveriesSubscription){
      this.mainDeliveriesSubscription.unsubscribe();
    }
  }
  public async searchMainProducts(text) {
    if (text != "") {
      this.isSearching = true;
      text = text.toLowerCase();
      let tag = new Parse.Query('ECommerceProduct')
        .contains('tag', text)
        .equalTo("enabled", true)
        .equalTo("status", true);
      let name = new Parse.Query('ECommerceProduct')
        .contains('nameSearch', text)
        .equalTo("enabled", true)
        .equalTo("status", true);
      let result = await Parse.Query.or(tag, name).find();
      this.mainProducts = result;
      this.mainPromos = [];
    } else {
      await this.getMainLists();
      this.isSearching = false;
    }
  }
  public async getMoreProducts(complete) {
    if (this.mainProducts.length < this.mainProductsCount) {
      let result = await this.productCtrl.mainProductQuery.limit(this.productCtrl.config.mainLimit).skip(this.mainProducts.length).find();
      this.mainProducts = this.mainProducts.concat(result);
      complete();
    }
  }
  public clearMainDeliveries() {
    this.unsubscribeMainDelivery();
    this.mainDeliveries = [];
  }
}
