import { open, put, getall } from "./storage.js";
import { traverse, inverse } from "./json.js";

function getlocalstate(dbname, storename){

    return new Promise((resolve, reject) => {
        open(dbname, storename)
            .then((db) => getall(db, storename))
            .then((result) => {
                result.get('db').close();
                resolve(result.get('items'))
            })
            .catch((error) => reject(error));
    });
}

function getremotejson(url){
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        // .then((data) => {
        //     console.log(data);
        // });
}

function get(input){
    // https://stackoverflow.com/questions/73542644/get-request-with-js
    // const url = "http://localhost:3000/posts?_embed=comments"; //"/books?" + new URLSearchParams({rank, title});

    // https://developer.mozilla.org/en-US/docs/Web/API/URL
    const url = new URL(input);
    
    return getlocalstate("unstaged", url.pathname + url.search)
        .then((items) => getlocalstate(url.hostname, url.pathname + url.search))
        .then((items) => getremotejson(url));
}

function toState(json){
    let items = [];
    
    for(let [key, value, path, parent] of traverse(json)) {

        if (value === null || typeof(value) !== "object"){
            items.push({id: path.join('.'), value: value, timestamp: Date.UTC(), version: 0, deleted: 0})
        }
    }

    return items;
}

function fromState(items, excludedeleted = true){
    let obj = isNaN(items && items.length > 0 && items[0].id.split('.')[0]) ? {} : [];
    
    for (let item of items){
        if (!excludedeleted || !item.deleted){
            inverse(obj, item.id.split('.'), item.value);
        }
    }

    return obj;
}

export { get, toState, fromState }
