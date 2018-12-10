'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1542160998005_7429';

  // add your config here
  config.middleware = [];
  config.cors = { origin: '*' };

  config.security = {
    xframe: {
      enable: false,
    },
    csrf: {
      enable: false,
    },
  };

  config.parameters = {
    // param names that you want filter in log.
    filterParameters: [ 'password' ],
  };

  config.kafkajs = {
    host: '10.28.18.4:9092',
    encoding: 'buffer', // trans binary data
    keyEncoding: 'utf8',
    sub: [
      {
        groupId: 'event-keepwork-queue',
        throttle: {
          concurrency: 1,
          highWaterMark: 100,
        },
        topics: [
          'evt_kp_queue',
        ],
      },
      {
        groupId: 'event-keepwork-common',
        topics: [
          'evt_kp_common',
        ],
      },
    ],
    pub:
    {
      topics: [
        'evt_kp_queue',
        'evt_kp_common',
      ],
      partition: 0,
      attributes: 0,
    },
    env: 'development',
    avroSchema: {
      namespace: 'com.keepwork.statistic',
      type: 'record',
      name: 'events',
      fields: [
        { name: 'env', type: 'string', doc: " 环境变量, 如:'development', 'testing', 'staging', 'production'" },
        { name: 'requestId', type: 'string', doc: '请求唯一标识' },
        { name: 'sysCode', type: 'string', doc: '发送方系统代码' },
        { name: 'requestType', type: 'string', doc: '请求操作类型' },
        { name: 'requestFlag', type: 'string', doc: '消息类型，0：请求，1：回复，2：ack' },
        { name: 'timestamp', type: 'string', doc: '请求操作时间' },
        { name: 'param', type: [{ type: 'map', values: 'string' }, 'null' ], doc: '系统级别扩展参数' },
        { name: 'payload', type: 'bytes', doc: '业务数据' },
      ],
    },
  };

  config.elk = {
    host: 'http://10.28.18.7:8099',
  };

  return config;
};
