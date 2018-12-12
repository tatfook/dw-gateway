'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

class AnalysticsController extends Controller {
  async event() {
    const event = this.ctx.params.permit('category', 'action', 'data', 'tags');
    await this.ctx.service.event.sendToKafka(event);
    await this.ctx.service.event.sendToELK(event);
    this.ctx.body = 'messages sended';
  }

  async events() {
    const { events } = this.ctx.params.permit('events');
    if (events instanceof Array) {
      const records = [];
      for (let i = 0; i < events.length; i++) {
        try {
          const event = _.pick(events[i], [ 'category', 'action', 'data', 'tags' ]);
          if (!event.category || !event.action) {
            records.push('invalid category or action!');
            continue;
          }
          await this.ctx.service.event.sendToKafka(event);
          await this.ctx.service.event.sendToELK(event);
          records.push('success');
        } catch (e) {
          records.push('fail');
          console.error(e);
        }
      }
      this.ctx.body = records;
    } else {
      this.ctx.logger.error('invalid events');
      this.ctx.body = { success: false };
    }
  }
}

module.exports = AnalysticsController;
