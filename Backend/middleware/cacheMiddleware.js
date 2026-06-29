// In-memory cache with TTL — no Redis required
const cache = new Map();

/**
 * @param {number} ttlSeconds - Cache duration in seconds
 */
const cacheMiddleware = (ttlSeconds = 120) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    // Bypass cache for admin users
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
        res.set('X-Cache', 'HIT');
        return res.json(cached.data);
    }

    // Override res.json to intercept the response and cache it
    const originalJson = res.json.bind(res);
    res.json = (data) => {
        if (res.statusCode === 200) {
            cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
        }
        res.set('X-Cache', 'MISS');
        return originalJson(data);
    };

    next();
};

// Invalidate a specific cache key (call after mutations)
const invalidateCache = (pattern) => {
    for (const key of cache.keys()) {
        if (key.includes(pattern)) cache.delete(key);
    }
};

module.exports = { cacheMiddleware, invalidateCache };
