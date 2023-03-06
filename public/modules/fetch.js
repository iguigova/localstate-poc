function getremote(url){
    return sendremote("GET", url);
}

function sendremote(method, url, data){
    return fetch(url,{
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: data && JSON.stringify(data),
    })
    .then((response) => toJson(response));
}

function sendallremote(url, data){
    let requests = []
    
    for (const request of data){
        requests.push(sendremote(request.method, new URL(request.url, url), request.data));
    }
    
    return Promise.all(requests);
}

function toJson(response){
    return new Promise((resolve, reject) => {
        if (response.ok) {
            resolve(response.json());
        } else {
            reject(response);
        }
    });
}

export { getremote, sendremote, sendallremote }
