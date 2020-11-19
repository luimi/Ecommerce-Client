import { Injectable } from '@angular/core';
import Parse from 'parse';
@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  public Deliveries = [];
  public DeliveryStatus = { 1: 'Solicitado', 2: 'En proceso', 3: 'Enviado', 4: 'Entregado', 5: 'Cancelado' };
  public DeliveryStatusIcon = { 1: 'checkmark', 2: 'hourglass', 3: 'bicycle', 4: 'checkmark-done' , 5: 'close'};
  public deliveriesQuery = new Parse.Query("ECommerceDelivery")
    .include('address')
    .include('receipt')
    .descending('createdAt')
    .greaterThan('status', 0)
    .lessThan('status', 4);
  public deliveriesQuerySubscription;
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
    this.Deliveries = await new Parse.Query("ECommerceDelivery")
      .include('address')
      .include('receipt')
      .descending('createdAt')
      .find();
  }
  public async subscribeMainDelivery(update,create) {
    if(!this.deliveriesQuerySubscription){
      this.deliveriesQuerySubscription = await this.deliveriesQuery.subscribe();
      this.deliveriesQuerySubscription.on('update',update);
      this.deliveriesQuerySubscription.on('create',create);
    }
    /*const lqc = this.parseUtils.getLiveQueryClient();
    const subscription = lqc.subscribe(this.deliveries);
    if(update){
      subscription.on('update', update);
    }
    return subscription;*/
  }
  public async cancelDelivery(delivery) {
    delivery.set('status', 5);
    await delivery.save();
  }
}
