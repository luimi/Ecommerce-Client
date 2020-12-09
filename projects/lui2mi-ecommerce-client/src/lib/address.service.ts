import { Injectable } from '@angular/core';
import Parse from 'parse';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  public addresses = [];
  constructor(private utils: UtilsService) { }
  

  public async getAdresses() {
    if(this.addresses.length === 0){
      this.addresses = await new Parse.Query('ECommerceAddress').equalTo('status', true).find();
    }
  }

  public async deleteAddress(address) {
    await address.set('status', false).save();
    this.getAdresses();
  }

  public async saveAdress(data) {
    const address = this.utils.parseGenericObject('ECommerceAddress');
    address.set('status', true);
    address.set('user', Parse.User.current());
    address.set('location', data.location);
    address.set('address',data.address);
    address.set('extra',data.extra);
    address.setACL(await this.utils.getACL());
    return await address.save(data);
  }

  public clearAddresses(){
    this.addresses = [];
  }
}
