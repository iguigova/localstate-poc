json-server // https://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server/23122981?r=Saves_UserSavesList#23122981


//-----------

enqueue:
key, item -> database -> object store // transparent errors? 

dequeue:
database -> object store -> batch/cursor -> post/put // retry logic?, online check, batch size?, timed trigger?

questions:
    - pending transactions? queue [{post/put + item}, ...] vs. item
    - queue purges should be automatic? assumption: posted items are purged
    - post of individual records or batched records?
    - optimistic merge... etag? what happens if a post/put is rejected, can we rollback??

assumption:
    - multiple updates to item result in multiple queue records

note:
    - transaction order is maintained by use of key (indexdb is ordered)

//-------- https://web.dev/indexeddb/

if (!('indexedDB' in window)) {
  console.log("This browser doesn't support IndexedDB");
  return;
}

const dbPromise = idb.open('test-db2', 1, function (upgradeDb) {
  console.log('Creating a new object store.');
  if (!upgradeDb.objectStoreNames.contains('logs')) {
    upgradeDb.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
  }
});


dbPromise
  .then(function (db) {
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    const item = {
      name: 'sandwich',
      price: 4.99,
      description: 'A very tasty sandwich',
      created: new Date().getTime(),
    };
    store.add(item);
    return tx.complete;
  })
  .then(function () {
    console.log('Added item to the store!');
  });

// someObjectStore.get(primaryKey);
// someObjectStore.put(data, optionalKey);
// someObjectStore.delete(primaryKey);

dbPromise
  .then(function (db) {
    const tx = db.transaction('store', 'readonly');
    const store = tx.objectStore('store');
    return store.openCursor();
  })
  .then(function logItems(cursor) {
    if (!cursor) {
      return;
    }
    console.log('Cursored at:', cursor.key);
    for (const field in cursor.value) {
      console.log(cursor.value[field]);
    }
    return cursor.continue().then(logItems);
  })
  .then(function () {
    console.log('Done cursoring.');
  });

// full spec: https://www.w3.org/TR/IndexedDB/
// idb: https://web.dev/indexeddb


//--------- https://javascript.info/indexeddb
let db = await idb.openDB('store', 1, db => {
  if (db.oldVersion == 0) {
    // perform the initialization
    db.createObjectStore('books', {keyPath: 'id'});
  }
});

let transaction = db.transaction('books', 'readwrite');
let books = transaction.objectStore('books');

try {
  await books.add(...);
  await books.add(...);

  await transaction.complete;

  console.log('jsbook saved');
} catch(err) {
  console.log('error', err.message);
}
