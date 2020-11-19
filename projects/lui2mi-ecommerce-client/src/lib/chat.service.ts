import { Injectable } from '@angular/core';
import Parse from 'parse';
import { UtilsService } from './utils.service';
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private utils: UtilsService) { }

  private chatMessagesSubscription;
  public chatUnreadMessages = {};
  private chatUnreadMessagesSubscription;

  public async getChatUnreadMessages() {
    const user = Parse.User.current();
    const query = new Parse.Query('ECommerceChatMessage').select('delivery').notEqualTo('readedBy', user).notEqualTo('from', user);
    let unread = await query.find();
    unread.forEach(message => {
      this.addUnreadMessage(message);
    });
    if (!this.chatUnreadMessagesSubscription) {
      this.chatUnreadMessagesSubscription = await query.subscribe();
      this.chatUnreadMessagesSubscription.on('create', (message) => {
        this.addUnreadMessage(message);
      });
    }
  }
  private addUnreadMessage(message) {
    if (!this.chatUnreadMessages[message.get('delivery').id]) {
      this.chatUnreadMessages[message.get('delivery').id] = [];
    }
    this.chatUnreadMessages[message.get('delivery').id].push(message);
  }
  public async getChatMessages(deliveryId, update) {
    const user = Parse.User.current();
    let delivery = this.utils.parseGenericObjectWithId("ECommerceDelivery", deliveryId);
    const queryMessages = new Parse.Query('ECommerceChatMessage').equalTo('delivery', delivery).include('from');
    let messages = await queryMessages.find();
    this.chatMessagesSubscription = await queryMessages.subscribe();
    this.chatMessagesSubscription.on('create', (message) => {
      message.relation('readedBy').add(user).save();
      if (update) {
        update(message);
      }
    });
    this.setReadedUnreadedMessages(delivery, user);
    return messages;
  }
  private async setReadedUnreadedMessages(delivery, user) {

    const queryUnreadMessages = new Parse.Query('ECommerceChatMessage').select('delivery').notEqualTo('readedBy', user).notEqualTo('from', user).equalTo('delivery', delivery);
    const unread = await queryUnreadMessages.find();
    unread.forEach(message => {
      message.relation('readedBy').add(user);
    });
    await Parse.Object.saveAll(unread);
    if (this.chatUnreadMessages[delivery.id]) {
      delete this.chatUnreadMessages[delivery.id];
    }
  }
  public leaveChatMessages() {
    this.chatMessagesSubscription.unsubscribe();
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
