/**
 * geo-resolver.js — IP to Geo-location lookup with local LRU caching.
 */

const cache = new Map();

export async function resolveGeo(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Localhost', city: 'Dev Machine', flag: '💻', lat: 23.8103, lon: 90.4125 };
  }

  if (cache.has(ip)) return cache.get(ip);

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`);
    const data = await res.json();

    if (data && data.status === 'success') {
      const flag = getFlagEmoji(data.countryCode);
      const result = {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        flag,
        lat: data.lat || 0,
        lon: data.lon || 0
      };
      if (cache.size > 1000) cache.clear();
      cache.set(ip, result);
      return result;
    }
  } catch (err) {
    console.warn('GeoIP lookup failed:', err.message);
  }

  return { country: 'Unknown', city: 'Unknown', flag: '🌐', lat: 0, lon: 0 };
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
