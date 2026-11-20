const cache = new Map();
const DEFAULT_TTL_MS = 60 * 1000;
const MAX_ENTRIES = 1000;

function makeKey(namespace, req) {
  const query = Object.keys(req.query)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(req.query[key])}`)
    .join('&');
  return `${namespace}:${req.path}?${query}`;
}

function cacheResponse(namespace, ttlMs = DEFAULT_TTL_MS) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = makeKey(namespace, req);
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      res.status(cached.status).set(cached.headers).send(cached.body);
      return;
    }
    if (cached) cache.delete(key);

    const originalSend = res.send.bind(res);
    res.send = body => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body !== undefined) {
        if (cache.size >= MAX_ENTRIES) {
          for (const [entryKey, entry] of cache) {
            if (entry.expiresAt <= Date.now() || cache.size >= MAX_ENTRIES) {
              cache.delete(entryKey);
            }
          }
        }
        cache.set(key, {
          status: res.statusCode,
          headers: {
            'Content-Type': res.get('Content-Type') || 'application/json; charset=utf-8'
          },
          body,
          expiresAt: Date.now() + ttlMs
        });
      }
      return originalSend(body);
    };
    next();
  };
}

function invalidateCache(namespace) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = body => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const key of cache.keys()) {
          if (key.startsWith(`${namespace}:`)) cache.delete(key);
        }
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { cacheResponse, invalidateCache };
