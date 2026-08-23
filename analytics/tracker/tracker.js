/**
 * tracker.js — Standalone client tracker (< 2KB)
 */

(function (window, document) {
  'use strict';
  var script = document.currentScript;
  var serverUrl = (script && script.src) ? script.src.replace(/\/api\/embed-script.*$/, '') : '';

  var sessionId = sessionStorage.getItem('__ac_analytics_sid');
  if (!sessionId) {
    sessionId = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('__ac_analytics_sid', sessionId);
  }

  function post(endpoint, data) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', serverUrl + endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } catch (e) {
      void e;
    }
  }

  function trackVisit() {
    post('/api/event', {
      sessionId: sessionId,
      page: window.location.pathname,
      referrer: document.referrer
    });
  }

  function heartbeat() {
    if (document.visibilityState === 'visible') {
      post('/api/heartbeat', { sessionId: sessionId });
    }
  }

  trackVisit();
  setInterval(heartbeat, 25000);
})(window, document);
