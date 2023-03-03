import { open, put, clear, getall } from "./storage.js";
import { traverse, inverse } from "./json.js";

function getstate(dbname, storename){
    return open(dbname, storename)
        .then((db) => getall(db, storename))
        .then((result) => {
            result.get('db').close();
            return result.get('items');
        });
}

function putstate(dbname, storename, state){
    return open(localdbname, storename)
        .then((db) => clear(db, storename))
        .then((db) => put(db, storename, state))
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

function getremote(url){
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
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

async function getmergedstate(url, mergefunc = ((s, t) => s.version > t.version ? s : t)){
    const storename = url.pathname + url.search;

    // note: already equivalently ordered by indexeddb
    const localstate = await getstate(localdbname, storename);
    const hoststate = await getstate(url.hostname, storename);
    
    // let mergedstate = [];
    // // https://stackoverflow.com/questions/10179815/get-loop-counter-index-using-for-of-syntax-in-javascript
    // for (const [i, hostitem] of hoststate.entries()) {
    //     let localitem = localstate[i];

    //     if (localitem.id == hostitem.id){
    //         mergedstate.push(mergefunc(localitem, hostitem));
    //     } else {
    //         localitem = localstate.find(item => item.id == hostitem.id) ?? hostitem;
    //         if (localitem.id == hostitem.id){
    //             mergedstate.push(mergefunc(localitem, hostitem));
    //         }
    //     }
    // }
    // // check for items in localstate that did not make it to mergedstate but we want to keep
    // // https://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
    // const hostdeletedoverride = localstate.filter(item => item.version > 0 && !mergedstate.some((m) => m.d == item.id));
    // hostdeletedoverride.forEach((item) => mergedstate.push(item));

    let mergedstate = localstate.filter(item => item.version > 0);
    hoststate.filter(item => !mergedstate.some((m) => m.d == item.id)).forEach(item => mergedstate.push(item));
    
    return mergedstate;
}

// function diffs(unstaged, host){
//     url -> path + search params

//     take 1, 1
//     if h
// }

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

export { get, stash, merge, toState, fromState }
