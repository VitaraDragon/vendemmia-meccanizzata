// Firebase Query Optimizer
// Sistema di ottimizzazione per query Firebase con caching e filtri avanzati

/**
 * Cache locale per ridurre chiamate Firebase ripetute
 */
const firebaseCache = {
    clients: {
        data: null,
        timestamp: null,
        ttl: 5 * 60 * 1000 // 5 minuti
    },
    tariffe: {
        data: null,
        timestamp: null,
        ttl: 10 * 60 * 1000 // 10 minuti (meno frequenti)
    },
    calcoli: {
        data: null,
        timestamp: null,
        ttl: 2 * 60 * 1000 // 2 minuti
    },
    spese: {
        data: null,
        timestamp: null,
        ttl: 2 * 60 * 1000 // 2 minuti
    }
};

/**
 * Verifica se i dati in cache sono ancora validi
 * @param {string} cacheKey - Chiave della cache
 * @returns {boolean}
 */
function isCacheValid(cacheKey) {
    const cache = firebaseCache[cacheKey];
    if (!cache || !cache.data || !cache.timestamp) {
        return false;
    }
    const age = Date.now() - cache.timestamp;
    return age < cache.ttl;
}

/**
 * Ottiene dati dalla cache se validi
 * @param {string} cacheKey - Chiave della cache
 * @returns {any|null}
 */
function getFromCache(cacheKey) {
    if (isCacheValid(cacheKey)) {
        console.log(`[Cache Hit] ${cacheKey}`);
        return JSON.parse(JSON.stringify(firebaseCache[cacheKey].data)); // Deep copy
    }
    console.log(`[Cache Miss] ${cacheKey}`);
    return null;
}

/**
 * Salva dati nella cache
 * @param {string} cacheKey - Chiave della cache
 * @param {any} data - Dati da salvare
 */
function setCache(cacheKey, data) {
    firebaseCache[cacheKey] = {
        data: data,
        timestamp: Date.now(),
        ttl: firebaseCache[cacheKey]?.ttl || 5 * 60 * 1000
    };
    console.log(`[Cache Set] ${cacheKey}`);
}

/**
 * Invalida la cache per una chiave specifica
 * @param {string} cacheKey - Chiave della cache da invalidare
 */
function invalidateCache(cacheKey) {
    if (firebaseCache[cacheKey]) {
        firebaseCache[cacheKey].data = null;
        firebaseCache[cacheKey].timestamp = null;
        console.log(`[Cache Invalidated] ${cacheKey}`);
    }
}

/**
 * Invalida tutta la cache
 */
function invalidateAllCache() {
    Object.keys(firebaseCache).forEach(key => {
        invalidateCache(key);
    });
    console.log('[Cache Invalidated] All');
}

/**
 * Query ottimizzata per clienti con caching
 * @param {Object} firebaseFunctions - Firebase functions object
 * @param {Object} db - Firestore database instance
 * @param {Object} options - Opzioni query (forceRefresh, limit, etc.)
 * @returns {Promise<Array>}
 */
async function getClientsOptimized(firebaseFunctions, db, options = {}) {
    const { forceRefresh = false, limit = null } = options;
    
    // Controlla cache se non è un refresh forzato
    if (!forceRefresh) {
        const cached = getFromCache('clients');
        if (cached) {
            return cached;
        }
    }
    
    // Costruisci query
    let query = firebaseFunctions.query(
        firebaseFunctions.collection(db, 'clients'),
        firebaseFunctions.orderBy('nome')
    );
    
    // Aggiungi limite se specificato
    if (limit && typeof firebaseFunctions.limit === 'function') {
        query = firebaseFunctions.query(query, firebaseFunctions.limit(limit));
    }
    
    // Esegui query
    const querySnapshot = await firebaseFunctions.getDocs(query);
    const clients = [];
    querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() });
    });
    
    // Salva in cache
    setCache('clients', clients);
    
    return clients;
}

/**
 * Query ottimizzata per calcoli con filtri anno e caching
 * @param {Object} firebaseFunctions - Firebase functions object
 * @param {Object} db - Firestore database instance
 * @param {number} anno - Anno da filtrare (opzionale)
 * @param {Object} options - Opzioni query (forceRefresh, limit, etc.)
 * @returns {Promise<Array>}
 */
async function getCalculationsOptimized(firebaseFunctions, db, anno = null, options = {}) {
    const { forceRefresh = false, limit = null } = options;
    const cacheKey = anno ? `calcoli_${anno}` : 'calcoli';
    
    // Controlla cache se non è un refresh forzato
    if (!forceRefresh) {
        const cached = getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
    }
    
    // Costruisci query base
    let query = firebaseFunctions.query(
        firebaseFunctions.collection(db, 'calcoli')
    );
    
    // Aggiungi filtro per anno se specificato (richiede campo 'anno' o 'dataVendemmia' indicizzato)
    if (anno && typeof firebaseFunctions.where === 'function') {
        // Prova prima con campo 'anno' se esiste
        query = firebaseFunctions.query(
            query,
            firebaseFunctions.where('anno', '==', anno)
        );
    } else {
        // Fallback: ordina per data
        if (typeof firebaseFunctions.orderBy === 'function') {
            query = firebaseFunctions.query(
                query,
                firebaseFunctions.orderBy('createdAt', 'desc')
            );
        }
    }
    
    // Aggiungi limite se specificato
    if (limit && typeof firebaseFunctions.limit === 'function') {
        query = firebaseFunctions.query(query, firebaseFunctions.limit(limit));
    }
    
    // Esegui query
    const querySnapshot = await firebaseFunctions.getDocs(query);
    const calculations = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        calculations.push({
            id: doc.id,
            ...data,
            dataVendemmia: data.dataVendemmia || data.createdAt?.toDate?.() || new Date()
        });
    });
    
    // Se anno specificato ma non abbiamo campo 'anno', filtra lato client
    if (anno && !calculations[0]?.anno) {
        const filtered = calculations.filter(calc => {
            const dataVendemmia = calc.dataVendemmia;
            const calcAnno = dataVendemmia instanceof Date 
                ? dataVendemmia.getFullYear() 
                : new Date(dataVendemmia).getFullYear();
            return calcAnno === anno;
        });
        setCache(cacheKey, filtered);
        return filtered;
    }
    
    // Salva in cache
    setCache(cacheKey, calculations);
    
    return calculations;
}

/**
 * Query ottimizzata per spese con filtri anno e caching
 * @param {Object} firebaseFunctions - Firebase functions object
 * @param {Object} db - Firestore database instance
 * @param {number} anno - Anno da filtrare (opzionale)
 * @param {Object} options - Opzioni query (forceRefresh, limit, etc.)
 * @returns {Promise<Array>}
 */
async function getSpeseOptimized(firebaseFunctions, db, anno = null, options = {}) {
    const { forceRefresh = false, limit = null } = options;
    const cacheKey = anno ? `spese_${anno}` : 'spese';
    
    // Controlla cache se non è un refresh forzato
    if (!forceRefresh) {
        const cached = getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
    }
    
    // Costruisci query base
    let query = firebaseFunctions.query(
        firebaseFunctions.collection(db, 'spese')
    );
    
    // Aggiungi filtro per anno se specificato
    if (anno && typeof firebaseFunctions.where === 'function') {
        query = firebaseFunctions.query(
            query,
            firebaseFunctions.where('anno', '==', anno)
        );
    } else {
        // Ordina per data
        if (typeof firebaseFunctions.orderBy === 'function') {
            query = firebaseFunctions.query(
                query,
                firebaseFunctions.orderBy('data', 'desc')
            );
        }
    }
    
    // Aggiungi limite se specificato
    if (limit && typeof firebaseFunctions.limit === 'function') {
        query = firebaseFunctions.query(query, firebaseFunctions.limit(limit));
    }
    
    // Esegui query
    const querySnapshot = await firebaseFunctions.getDocs(query);
    const spese = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        spese.push({
            id: doc.id,
            ...data,
            data: data.data || data.createdAt?.toDate?.() || new Date()
        });
    });
    
    // Se anno specificato ma non abbiamo campo 'anno', filtra lato client
    if (anno && !spese[0]?.anno) {
        const filtered = spese.filter(spesa => {
            const dataSpesa = spesa.data;
            const spesaAnno = dataSpesa instanceof Date 
                ? dataSpesa.getFullYear() 
                : new Date(dataSpesa).getFullYear();
            return spesaAnno === anno;
        });
        setCache(cacheKey, filtered);
        return filtered;
    }
    
    // Salva in cache
    setCache(cacheKey, spese);
    
    return spese;
}

/**
 * Ottieni tariffe ottimizzate con caching
 * @param {Object} firebaseFunctions - Firebase functions object
 * @param {Object} db - Firestore database instance
 * @param {Object} options - Opzioni query (forceRefresh)
 * @returns {Promise<Object>}
 */
async function getTariffeOptimized(firebaseFunctions, db, options = {}) {
    const { forceRefresh = false } = options;
    
    // Controlla cache se non è un refresh forzato
    if (!forceRefresh) {
        const cached = getFromCache('tariffe');
        if (cached) {
            return cached;
        }
    }
    
    // Esegui query
    const tariffeRef = firebaseFunctions.doc(db, 'tariffe', 'current');
    const tariffeSnap = await firebaseFunctions.getDoc(tariffeRef);
    
    let tariffe = null;
    if (tariffeSnap.exists()) {
        const tariffeData = tariffeSnap.data();
        tariffe = tariffeData.tariffeVendemmia || null;
    }
    
    // Salva in cache
    if (tariffe) {
        setCache('tariffe', tariffe);
    }
    
    return tariffe;
}

// Esponi funzioni globalmente
window.firebaseOptimizer = {
    getClientsOptimized,
    getCalculationsOptimized,
    getSpeseOptimized,
    getTariffeOptimized,
    invalidateCache,
    invalidateAllCache,
    isCacheValid,
    getFromCache,
    setCache
};

console.log('✅ Firebase Optimizer caricato correttamente');

