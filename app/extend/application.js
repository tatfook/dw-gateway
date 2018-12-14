'use strict';
const axios = require('axios');

const LOGSTASH_CLIENT = Symbol('Application#logstashClient');

// app/extend/application.js
module.exports = {
  logstashClient() {
    if (!this[LOGSTASH_CLIENT]) {
      this[LOGSTASH_CLIENT] = axios.create({
        baseURL: this.config.elk.host,
        timeout: 10000,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
    }
    return this[LOGSTASH_CLIENT];
  },
};
