function getremote(url){
    return fetch(url)
        .then((response) => tojson(response));
}

async function postremote(url, datas = []){
    const requests = getrequests(url, datas, postrequestparams);
    const responses = await Promise.all(requests);
    
    let json = [];
    
    for (const response of responses) {
        json.push(tojson(response));
    }
    
    return Promise.all(json); 
}

function getrequests(url, data, requestparams){
    let requests = [];
        
    for (const item of data){
        requests.push(fetch(new URL(item.url, url), requestparams(item.data)));
    }
    
    return requests;
}

function postrequestparams(data){
    return {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }
}

async function tojson(response){
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    
    return response.json();
}

export { getremote, postremote }
