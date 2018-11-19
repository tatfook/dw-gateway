'use strict';

const Controller = require('egg').Controller;

class EventController extends Controller {
  async index() {
    console.log(this.ctx.params);
    const { event } = this.ctx.params.permit('event');
    await this.ctx.service.event.sendToKafka(event);
    this.ctx.body = 'messages sended';
  }
}

module.exports = EventController;
