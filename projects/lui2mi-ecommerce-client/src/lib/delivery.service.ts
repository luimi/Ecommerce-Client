import { Injectable } from '@angular/core';
import Parse from 'parse';
@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  public DeliveryStatus = { 1: 'Solicitado', 2: 'Confirmado', 3: 'Enviado', 4: 'Entregado', 5: 'Cancelado' };
  public deliveriesQuery = new Parse.Query("ECommerceDelivery")
  .include('address')
  .include('receipt')
  .greaterThan('status', 0)
  .lessThan('status', 4);

  constructor() { }

  public subscribeMainDelivery(update?) {
    /*const lqc = this.parseUtils.getLiveQueryClient();
    const subscription = lqc.subscribe(this.deliveries);
    if(update){
      subscription.on('update', update);
    }
    return subscription;*/
  }
}
