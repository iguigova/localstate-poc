import { open, put, getall } from "./storage.js";
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
            if (!state){
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

function get(input, ondata){
    // https://stackoverflow.com/questions/73542644/get-request-with-js
    // const url = "http://localhost:3000/posts?_embed=comments"; //"/books?" + new URLSearchParams({rank, title});

    // https://developer.mozilla.org/en-US/docs/Web/API/URL
    const url = new URL(input);

    let hasdata = false;
    
    return getlocal(url)
        .then((data) => {
            hasdata = data && ondata && ondata(data);
        })
        .then(() => getremote(url))
        .then((data) => {
            !hasdata && data && ondata && ondata(data);
            return data;
        });
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

export { get, toState, fromState }
