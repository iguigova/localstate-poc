import { open, put, getall } from "./storage.js";

function getlocal(dbname, storename){

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

function getremote(url){
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
    
    return getlocal("unstaged", url.pathname + url.search)
        .then((items) => getlocal(url.hostname, url.pathname + url.search))
        .then((items) => getremote(url));
}

export { get } 
