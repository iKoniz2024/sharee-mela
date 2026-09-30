const MAX_CACHE_SIZE = 500;
const cache = new Map();

/**
 * Caches the result of an asynchronous function in memory with size bounds and TTL.
 * 
 * @param {string} key - The unique cache key for the query
 * @param {number} ttlSeconds - Time-to-live in seconds
 * @param {Function} fetchFunction - The async function that fetches the data if it's not cached
 * @returns {Promise<any>} - The cached or freshly fetched data
 */
const withCache = async (key, ttlSeconds, fetchFunction) => {
    const now = Date.now();
    const cachedItem = cache.get(key);

    if (cachedItem && cachedItem.expiry > now) {
        return cachedItem.data;
    }

    // Cache miss or expired, fetch new data
    const data = await fetchFunction();
    
    // Evict oldest entry if max size reached
    if (cache.size >= MAX_CACHE_SIZE) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) cache.delete(oldestKey);
    }

    // Store in cache
    cache.set(key, {
        data,
        expiry: now + (ttlSeconds * 1000)
    });

    return data;
};

/**
 * Warm up cache for active banners, categories, and recent arrivals.
 * @param {any} db - The MongoDB Database instance
 */
const warmUpCache = async (db) => {
    if (!db) return;
    try {
        console.log("Warming up essential cache (banners, categories, home products)...");

        // 1. Warm up Banners
        const bannersCollection = db.collection("banners");
        await withCache("banners", 600, async () => {
            return await bannersCollection.find({}).sort({ createdAt: -1 }).toArray();
        });

        // 2. Warm up Categories
        const categoriesCollection = db.collection("categories");
        await withCache("categoriesWithCounts", 600, async () => {
            const categories = await categoriesCollection.find().sort({ createdAt: -1 }).toArray();
            return categories;
        });

        // 3. Warm up New Arrivals
        const productsCollection = db.collection("products");
        await withCache("newArrivals", 600, async () => {
            return await productsCollection
                .find({})
                .project({ description: 0, dimensions: 0, reviews: 0, images: 0 })
                .sort({ _id: -1 })
                .limit(12)
                .toArray();
        });

        console.log("Essential cache warmup completed successfully!");
    } catch (error) {
        console.error("Error warming up cache:", error);
    }
};

/**
 * Clears specific cache key, keys matching prefix, or all cache if no key provided.
 * @param {string} [prefixOrKey] 
 */
const clearCache = (prefixOrKey) => {
    if (!prefixOrKey) {
        cache.clear();
        return;
    }

    if (cache.has(prefixOrKey)) {
        cache.delete(prefixOrKey);
        return;
    }

    // Clear matching prefix
    for (const key of cache.keys()) {
        if (key.startsWith(prefixOrKey)) {
            cache.delete(key);
        }
    }
};

module.exports = {
    withCache,
    clearCache,
    warmUpCache
};

