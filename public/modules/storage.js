// https://javascript.info/indexeddb
// https://www.w3.org/TR/IndexedDB

function open(dbname, storename){

    return new Promise((resolve, reject) => {
        
        const request = indexedDB.open(dbname);

        request.onupgradeneeded = function(event) {

            let db = request.result;
            if (!db.objectStoreNames.contains(storename)) {
                db.createObjectStore(storename, {keyPath: 'id'});
            }
        }
        
        request.onsuccess = function(event) {
            resolve(request.result);
        };

        request.onerror = function(event) {
            reject(request.error);
        };
    })
}

function inittx(db, storename, mode, resolve, reject){

    let transaction = db.transaction(storename, mode);
    
    transaction.oncomplete = function() {
        resolve && resolve(db);
    };
    
    transaction.onabort = function() {
        reject && reject(transaction.error);
    };

    transaction.onerror = function() {
        reject && reject(transaction.error);
    }

    return Promise.resolve(transaction.objectStore(storename));
}

function put(db, storename, items){
    
    return new Promise((resolve, reject) => {

        inittx(db, storename, "readwrite", resolve, reject)
            .then((store) => {
                for (const item of items) {
                    store.put(item);
                }
            });
    })
}

function getall(db, storename){

    return new Promise((resolve, reject) => {

        inittx(db, storename, "readonly", null, reject)
            .then((store) => {
               
                let request = store.getAll();

                request.onsuccess = function() {
                    const result = new Map()
                    result.set('db', db);
                    
                    if (request.result !== undefined) {
                        
                        result.set('items', request.result);
                    } else {
                        result.set('items', []);
                    }

                    resolve(result);
                };                
            });
    });
}


export { open, put, getall };
