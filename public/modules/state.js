import { open, clear, putall, getall, getmetadata } from "./storage.js";
import { traverse, inverse } from "./json.js";
import { getremote, sendallremote } from "./fetch.js"

function getstate(dbname, storename){
    return open(dbname, storename)
        .then((db) => getall(db, storename))
        .then((result) => {
            result.db.close();
            return result.items;
        });
}

function putstate(dbname, storename, state){
    return open(dbname, storename)
        .then((db) => clear(db, storename))
        .then((db) => putall(db, storename, state))
        .then((db) => db.close());
}

const localdbname = "local";

function getlocal(url){
    return getstate(localdbname, url.pathname + url.search)
        .then((state) => {
            if (!state || state.length == 0){
                return getstate(url.hostname, url.pathname + url.search);
            }

            return state;
        })
        .then((state) => fromState(state));
}

async function get(url, ondata){
    const localdata = await getlocal(url);
    localdata && ondata && ondata(localdata);
    
    const remotedata = await getremote(url);
    !localdata && remotedata && ondata && ondata(remotedata);
    
    return remotedata;
}

function stash(url, data){
    return putstate(url.hostname, url.pathname + url.search, toState(data));
}

async function merge(url){
    return putstate(localdbname, url.pathname + url.search, await getmergedstate(url));
}

async function getmergedstate(url){
    const storename = url.pathname + url.search;

    const localstate = await getstate(localdbname, storename);
    const hoststate = await getstate(url.hostname, storename);
    
    let mergedstate = localstate.filter(item => item.version > 0);  // updated

    // https://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
    hoststate.filter(item => !mergedstate.some((m) => m.id == item.id)).forEach(item => mergedstate.push(item)); // added

    localstate.filter(item => item.version == 0 && !mergedstate.some((m) => m.id == item.id)).forEach(item => { // deleted
        item.deleted = 1;
        mergedstate.push(item)
    }); 
    
    return mergedstate;
}

async function put(method, url, data){
    // TODO: update all affected stores 
    return putstate(localdbname, url.pathname + url.search, await getupdatedstate(url, data));
}

async function getupdatedstate(url, data){
    const storename = url.pathname;

    const newstate = toState(data);
    const localstate = await getstate(localdbname, storename);

    let updatedstate = [];
    // https://stackoverflow.com/questions/10179815/get-loop-counter-index-using-for-of-syntax-in-javascript
    for (const [i, newitem] of newstate.entries()) {
        let localitem = localstate[i];
         if (!localitem || localitem.id != newitem.id){
            localitem = localstate.find(item => item.id == newitem.id) ?? newitem; //updated or added
        }
 
        if (localitem.value != newitem.value){
            localitem.timestamp = new Date().toUTCString();
            localitem.version++;
            localitem.value = newitem.value;
        }

        updatedstate.push(localitem);
     }

    localstate.filter(item => !updatedstate.some((u) => u.id == item.id)).forEach((item) => { // deleted
        item.timestamp = new Date().toUTCString();
        item.version++;
        item.deleted = 1;
        updatedstate.push(item);
    });

    return updatedstate;
}

async function diff(url){  
    return open(localdbname)
        .then((db) => getmetadata(db, true))
        .then((metadata) => {
            let diffs = [];
            metadata.stores
                .filter(store => store.hasChanged)
                .forEach(store => {
                    diffs.push({method: "PUT", url: store.storename, data: fromState(store.items)}); // TODO: handle all changes
                });
            
            metadata.db.close();
            
            return diffs;
        })
        .then((diffs) => sendallremote(url, diffs));
        // TODO: reset version to 0
}

function toState(json){
    let items = [];
    
    for(let [key, value, path, parent] of traverse(json)) {

        if (value === null || typeof(value) !== "object"){
            items.push({id: path.join('.'), value: value, timestamp: new Date().toUTCString(), version: 0, deleted: 0, added: 0})
        }
    }
    
    return items;
}

function fromState(items, excludedeleted = true){
    if (items && items.length > 0) {
        let obj = isNaN(items[0].id.split('.')[0]) ? {} : [];
        
        for (let item of items){
            if (!excludedeleted || !item.deleted){
                inverse(obj, item.id.split('.'), item.value);
            }
        }
        
        return obj;
    }
}

export { get, stash, merge, diff, put, toState, fromState }
