'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/test', controller.test.index);

  router.post('/event', controller.analystics.event);
  router.post('/events', controller.analystics.events);
};
