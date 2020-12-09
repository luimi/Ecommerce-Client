import { Injectable } from '@angular/core';
import Parse from 'parse';
import { UtilsService } from './utils.service';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatMessagesSubscription;
  public chatUnreadMessages = {};
  private currentChat :any;

  constructor(private utils: UtilsService) { 
    this.connectToChatServer();
  }

  public async connectToChatServer() {
    if (!this.utils.isLogedIn() || this.chatMessagesSubscription) {
      return;
    }
    const chatMessagesQuery = new Parse.Query('ECommerceChatMessage');
    this.chatMessagesSubscription = await chatMessagesQuery.subscribe();
    this.chatMessagesSubscription.on('create',(message)=>{
      if(this.currentChat && this.currentChat.id === message.get('delivery').id){
        message.relation('readedBy').add(user).save();
        this.currentChat.callback(message);
      } else {
        this.addUnreadMessage(message);
      }
    });
    const user = this.utils.getCurrentUser();
    const chatUnreadMessagesQuery = new Parse.Query('ECommerceChatMessage').select('delivery').notEqualTo('readedBy', user).notEqualTo('from', user);
    let unread = await chatUnreadMessagesQuery.find();
    unread.forEach(message => {
      this.addUnreadMessage(message);
    });
  }
  public clearCurrentChat(){
    this.currentChat = undefined;
  }
  private addUnreadMessage(message) {
    if (!this.chatUnreadMessages[message.get('delivery').id]) {
      this.chatUnreadMessages[message.get('delivery').id] = [];
    }
    this.chatUnreadMessages[message.get('delivery').id].push(message);
  }
  public async getChatMessages(deliveryId, callback) {
    const user = Parse.User.current();
    let delivery = this.utils.parseGenericObjectWithId("ECommerceDelivery", deliveryId);
    const queryMessages = new Parse.Query('ECommerceChatMessage').equalTo('delivery', delivery).include('from');
    let messages = await queryMessages.find();
    const queryUnreadMessages = new Parse.Query('ECommerceChatMessage').select('delivery').notEqualTo('readedBy', user).notEqualTo('from', user).equalTo('delivery', delivery);
    const unread = await queryUnreadMessages.find();
    unread.forEach(message => {
      message.relation('readedBy').add(user);
    });
    await Parse.Object.saveAll(unread);
    if (this.chatUnreadMessages[delivery.id]) {
      delete this.chatUnreadMessages[delivery.id];
    }
    this.currentChat = {id:deliveryId, callback: callback};
    return messages;
  }
  public exitChatServer() {
    this.chatMessagesSubscription.unsubscribe();
    this.clearCurrentChat();
    this.chatUnreadMessages = {};
  }
  public async sendChatMessage(deliveryId, text) {
    let message = this.utils.parseGenericObject('ECommerceChatMessage');
    let delivery = this.utils.parseGenericObjectWithId("ECommerceDelivery", deliveryId);
    message.set('delivery', delivery);
    message.set('from', Parse.User.current());
    message.set('message', text);
    message.setACL(await this.utils.getACL());
    await message.save();
  }
}
