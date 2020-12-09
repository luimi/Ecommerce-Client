import { Injectable } from '@angular/core';
import Parse from 'parse';
@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  public Deliveries = [];
  private deliveriesSubscription;
  public DeliveryStatus = { 1: 'Solicitado', 2: 'En proceso', 3: 'Enviado', 4: 'Entregado', 5: 'Cancelado' };
  public DeliveryStatusIcon = { 1: 'checkmark', 2: 'hourglass', 3: 'bicycle', 4: 'checkmark-done' , 5: 'close'};
  public mainDeliveriesQuery = new Parse.Query("ECommerceDelivery")
    .include('address')
    .include('receipt')
    .descending('createdAt')
    .greaterThan('status', 0)
    .lessThan('status', 4);
  constructor() { }

  public async getDelivery(id) {
    return await new Parse.Query("ECommerceDelivery")
      .include('address')
      .include('receipt')
      .get(id);
  }
  public async subscribeDeliveryUpdates(id, update){
    let query = new Parse.Query("ECommerceDelivery")
    .include('address')
    .include('receipt')
    .equalTo('objectId',id);
    let subscripction = await query.subscribe();
    subscripction.on('update',update);
    return subscripction;
  }
  public unsubscribeDeliveryUpdates(subscripction){
    subscripction.unsubscribe();
  }
  public async getDeliveries() {
    const query = new Parse.Query("ECommerceDelivery")
      .include('address')
      .include('receipt')
      .descending('createdAt');
    this.Deliveries = await query.find();
    if(!this.deliveriesSubscription){
      this.deliveriesSubscription = await query.subscribe();
      this.deliveriesSubscription.on('update',()=>{});
      this.deliveriesSubscription.on('create',(delivery)=>{
        this.Deliveries.unshift(delivery);
      });
    }
  }
  private unsubscribeDeliveries(){
    if(this.deliveriesSubscription){
      this.deliveriesSubscription.unsubscribe();
    }
  }
  public async cancelDelivery(delivery) {
    delivery.set('status', 5);
    await delivery.save();
  }
  public clearDeliveries(){
    this.unsubscribeDeliveries();
    this.Deliveries = [];
  }
}
