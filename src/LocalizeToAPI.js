
const baseURL = 'https://localize.to/api'

const defaultHeader = {
    'Content-Type': 'application/json',
}

export function FETCH(method, url, body, success, failure, header = null) {

    const URL      = url.startsWith('http') ? url : baseURL + url
    const HEADERS  = { ...defaultHeader, ...header }

    fetch(URL,
        {
        method:     method,
        crossDomain:true,
        headers:    HEADERS,
        body:       body ? JSON.stringify(body) : null
        })
        .then(response => response.json())
        // .then(response => {
        //     console.log(response)
        //     return response.text()
        // })
        // .then(text => JSON.parse(text))
        .then(data => {
            if (data.error) failure(data.error)
            else success(data)
        })
        .catch(error => failure(error))
}

export function GET(url, success, failure, header = null) {
    FETCH('GET', url, null, success, failure, header)
}

export function POST(url, body, success, failure, header = null) {
    FETCH('POST', url, body, success, failure, header)
}

export function PATCH(url, body, success, failure, header = null) {
    FETCH('PATCH', url, body, success, failure, header)
}

export function PUT(url, body, success, failure, header = null) {
    FETCH('PUT', url, body, success, failure, header)
}

export function DELETE(url, body, success, failure, header = null) {
    FETCH('DELETE', url, body, success, failure, header)
}
