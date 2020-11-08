import { Injectable } from '@angular/core';
import Parse from 'parse';
import { UtilsService } from './utils.service';
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private utils: UtilsService) { }

  public chatMessages = [];
  private chatMessagesSubscription;
  public chatUnreadMessages = [];
  private chatUnreadMessagesSubscription;
  public async getChatUnreadMessages(delivery){
    const user = Parse.User.current();
    const query = new Parse.Query('ECommerceChatMessage').select('delivery').notEqualTo('readedBy',user).notEqualTo('from',user).equalTo('delivery',delivery);
    this.chatUnreadMessages = await query.find();
    this.chatUnreadMessagesSubscription = await query.subscribe();

  }
  public async getChatMessages(delivery, update){
    const user = Parse.User.current();
      const queryMessages = new Parse.Query('ECommerceChatMessage').equalTo('delivery',delivery).include('from');
      this.chatMessages = await queryMessages.find();
      this.chatMessagesSubscription = await queryMessages.subscribe();
      this.chatMessagesSubscription.on('create', (message)=> {
        this.chatMessages.push(message);
        message.relation('readedBy').add(user).save();
        if(update){
          update(message);
        }
      });
      
      const queryUnreadMessages = new Parse.Query('ECommerceChatMessage').select('delivery').notEqualTo('readedBy',user).notEqualTo('from',user).equalTo('delivery',delivery);
      const unread = await queryUnreadMessages.find();
      unread.forEach(message => {
        message.relation('readedBy').add(user);
      });
      await Parse.Object.saveAll(unread);
  }
  public leaveChatMessages(){
    this.chatMessages = [];
    this.chatMessagesSubscription.unsubscribe();
  }
  public async sendChatMessage(delivery,text){
    let message = this.utils.parseGenericObject('ECommerceChatMessage');
    message.set('delivery',delivery);
    message.set('from',Parse.User.current());
    message.set('message',text);
    const adminRole = await this.utils.getAdminRole();
    let ACL = await this.utils.ACLPublicRead(adminRole);
    ACL.setWriteAccess(Parse.User.current(),true);
    message.setACL(ACL);
    await message.save();
  }
}
