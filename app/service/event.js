'use strict';
const Service = require('egg').Service;
// const axios = require('axios');
const _ = require('lodash');
const uuid = require('uuid/v4');


const eventRule = {
  keepwork: {
    etl: true,
    actions: {
      evt_kp_common: [ 'Hello' ],
      evt_kp_queue: [],
    },
    defaultKey: 'evt_kp_queue',
  },
  paracraft: {
    etl: false,
  },
};

const getEventTopicKey = (rule, action) => {
  let eventKey = rule.defaultKey;
  _.forEach(rule.actions, (value, key) => {
    if (_.indexOf(value, action) !== -1) {
      eventKey = key;
    }
  });
  return eventKey;
};

class EventService extends Service {
  async sendToELK(event) {
    // TODO
    return event;
  }

  async sendToKafka(event) {
    const rule = eventRule[event.type];
    if (!rule.etl) return false;
    const topic = getEventTopicKey(rule, event.action);
    const key = event.action;

    const options = {
      env: this.config.kafkajs.env,
      requestId: topic + '@' + uuid(),
      sysCode: process.env.sysCode || 'dw-gateway',
      requestType: key,
      requestFlag: '0',
      timestamp: _.now().toString(),
      param: {},
      partition: 0,
      attributes: 0,
      payload: Buffer.from(JSON.stringify({
        event,
      })),
    };
    const data = {};
    for (const field of this.config.kafkajs.avroSchema.fields) {
      data[field.name] = options[field.name] || null;
    }
    const buffer = this.ctx.helper.binaryEncode(data);
    const msg = [ this.ctx.kafka.Message(topic, key, buffer) ];
    try {
      console.log('message');
      await this.ctx.kafka.send(msg);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

module.exports = EventService;
