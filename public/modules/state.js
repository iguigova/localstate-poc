import { open, put, clear, getall } from "./storage.js";
import { traverse, inverse } from "./json.js";

function getlocalstate(dbname, storename){
    return open(dbname, storename)
        .then((db) => getall(db, storename))
        .then((result) => {
            result.get('db').close();
            return result.get('items');
        });
}

function getlocal(url){
    return getlocalstate("unstaged", url.pathname + url.search)
        .then((state) => {
            if (!state || state.length == 0){
                return getlocalstate(url.hostname, url.pathname + url.search);
            }

            return state;
        })
        .then((state) => fromState(state));
}

function getremote(url){
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
}

function get(url, ondata){
    let hasdata = false;
    
    return getlocal(url)
        .then((data) => {
            hasdata = data;
            data && ondata && ondata(data);
        })
        .then(() => getremote(url))
        .then((data) => {
            !hasdata && data && ondata && ondata(data);
            return data;
        });
}

function stash(url, data){
    var dbname = url.hostname;
    var storename = url.pathname + url.search;
    return open(dbname, storename)
        .then((db) => clear(db, storename))
        .then((db) => put(db, storename, toState(data)))
        .then((db) => db.close());
}

function toState(json){
    let items = [];
    
    for(let [key, value, path, parent] of traverse(json)) {

        if (value === null || typeof(value) !== "object"){
            items.push({id: path.join('.'), value: value, timestamp: Date.UTC(), version: 0, deleted: 0, added: 0})
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

export { get, stash, toState, fromState }
