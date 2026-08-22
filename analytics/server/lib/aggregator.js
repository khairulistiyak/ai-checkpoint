/**
 * aggregator.js — Compute stats for analytics dashboard.
 */

import { sessionManager } from './session-manager.js';
import { getTodayEvents } from './store.js';

export function getStats() {
  const activeSessions = sessionManager.getActiveSessions();
  const events = getTodayEvents();

  const countries = {};
  const devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
  const browsers = { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Other: 0 };
  const hourly = new Array(24).fill(0);

  events.forEach(e => {
    if (e.country) countries[e.country] = (countries[e.country] || 0) + 1;
    if (e.device && devices[e.device] !== undefined) devices[e.device]++;
    if (e.browser && browsers[e.browser] !== undefined) browsers[e.browser]++;
    else if (e.browser) browsers.Other++;

    const hour = new Date(e.timestamp || Date.now()).getHours();
    hourly[hour]++;
  });

  const countryRanking = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));

  return {
    liveCount: activeSessions.length,
    todayTotal: events.length,
    activeSessions,
    countries: countryRanking,
    devices,
    browsers,
    hourlyTrend: hourly,
    recentEvents: events.slice(-20).reverse()
  };
}
