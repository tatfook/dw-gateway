'use strict';

const Subscription = require('egg').Subscription;

class MessageConsumer extends Subscription {
  async subscribe(message) {
    // 处理消息业务逻辑
    console.log('Event Kp Common: Please consume this message', message.key);
  }
}
module.exports = MessageConsumer;
