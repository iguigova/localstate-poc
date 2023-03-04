// https://javascript.info/indexeddb
// https://www.w3.org/TR/IndexedDB

function open(dbname, storename){

    return new Promise((resolve, reject) => {
        
        const request = indexedDB.open(dbname);

        request.onupgradeneeded = function(event) {

            let db = request.result;
            
            if (storename && !db.objectStoreNames.contains(storename)) {
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

async function inittx(db, storename, mode, resolve, reject){

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

    return transaction.objectStore(storename);
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

function clear(db, storename){
    
    return new Promise((resolve, reject) => {
        
        inittx(db, storename, "readwrite", resolve, reject)
            .then((store) => store.clear());
    })
}

function getall(db, storename){

    return new Promise((resolve, reject) => {

        inittx(db, storename, "readonly", null, reject)
            .then((store) => {
                const request = store.getAll();
                
                request.onsuccess = function() {
                    resolve({db: db, storename: storename, items: (request.result !== undefined) ? request.result : []});
                };                
            });
    });
}

async function getmetadata(db, includestoreitems = false){

    let metadata = {db: db, stores: []};
    
    for (const storename of db.objectStoreNames){

        const result = await getall(db, storename);
       
        metadata.stores.push({
            storename: storename,
            hasChanged: result.items.some(item => item.verstion > 0),
            items: includestoreitems ? result.items : []
        });
    }

    return metadata; 
}

export { open, put, clear, getall, getmetadata };
