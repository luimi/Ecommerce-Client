import { Injectable } from '@angular/core';
import Parse from 'parse';
@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }
  public encodeObject(obj){
    return btoa(JSON.stringify(obj));
  }
  public decodeObject(string){
    return JSON.parse(atob(string));
  }
  public getStoredArray(name){
    const array = localStorage.getItem(name);
    try{
      return JSON.parse(array?array:"[]");
    }catch(e){
      return [];
    }
  }
  public setStoredArray(name,array){
    localStorage.setItem(name,JSON.stringify(array));
  }
  public ACLPublicRead(role?){
    var ACL = new Parse.ACL();
    ACL.setPublicReadAccess(true);
    ACL.setWriteAccess(Parse.User.current(),true)
    if(role){
      ACL.setRoleWriteAccess(role,true);
    }
    return ACL;
  }
  public async getAdminRole() {
    return await new Parse.Query(Parse.Role).equalTo("name","Administrator").first();
  }

  public parseObjectToObject(o, params){
    const result = {};
    params.forEach(param => {
      try{
        result[param] = o.get(param);
      }catch(e){}
    });
    return result;
  }

  public objectToParseObject(c,o,params){
    const Generic = Parse.Object.extend(c);
    const generic = new Generic();
    params.forEach(param => {
      generic.set(param,o[param]);
    });
    return generic;
  }

  public parseObjectSetParams(p,o,params){
    params.forEach(param => {
      p.set(param,o[param]);
    });
    return p;
  }

  public parseGenericObject(c){
    const Generic = Parse.Object.extend(c);
    return new Generic();
  }
}
