'use strict';
const Service = require('egg').Service;
const axios = require('axios');
const _ = require('lodash');
const uuid = require('uuid/v4');
const requestIp = require('request-ip');
const useragent = require('useragent');

// const eventRule = {
//   keepwork: {
//     etl: true,
//     actions: {
//       evt_kp_common: [ 'Hello' ],
//       evt_kp_queue: [],
//     },
//     defaultKey: 'evt_kp_queue',
//   },
//   paracraft: {
//     etl: false,
//   },
// };

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
    const agent = useragent.parse(this.ctx.request.headers['user-agent']);
    const data = {
      event,
      client: {
        agent: agent.toString(),
        ip: requestIp.getClientIp(this.ctx.request),
      },
    };
    const res = await axios({
      method: 'post',
      url: this.config.elk.host,
      data,
    });

    return res.data;
  }

  async sendToKafka(event) {
    const eventRules = this.config.eventRules || {};
    const rule = eventRules[event.category];
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
      await this.ctx.kafka.send(msg);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

module.exports = EventService;
