import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  public addresses = [];
  constructor() { }
  

  public async getAdresses() {
    this.addresses = await new Parse.Query('ECommerceAddress').equalTo('status', true).find();
  }

  public async deleteAddress(address) {
    await address.set('status', false).save();
    this.getAdresses();
  }

  public async saveAdress(data) {
    const Address = Parse.Object.extend('ECommerceAddress');
    const address = new Address();
    address.set('status', true);
    address.set('user', Parse.User.current());
    data.location = new Parse.GeoPoint({ latitude: data.location[0], longitude: data.location[1] });
    const ACL = new Parse.ACL();
    ACL.setPublicReadAccess(true);
    ACL.setWriteAccess(Parse.User.current(), true);
    address.setACL(ACL);
    return await address.save(data);
  }
}
