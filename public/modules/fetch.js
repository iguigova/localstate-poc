function getremote(url){
    return fetch(url)
        .then((response) => tojson(response));
}

async function postremote(url, data = []){
    const requests = getrequests(data, postrequestparams);
    const responses = await Promise.all(requests);
    let result = [];
    
    for (const response of responses) {
        result.push(response.tojson());
    }

    return result; 
}

function getrequests(data, requestparams){
    let requests = [];
    data.forEach((item) => requests.push(fetch(new Url(itme.url, url), requestparams(item.data))));
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
