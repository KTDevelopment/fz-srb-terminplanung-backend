import * as request from "supertest";

export function getAuthenticated(url, token?: string) {
    return authenticatedRequest('get', url, token)
}

export function postAuthenticated(url, token?: string) {
    return authenticatedRequest('post', url, token)
}

export function patchAuthenticated(url, token?: string) {
    return authenticatedRequest('patch', url, token)
}

export function putAuthenticated(url, token?: string) {
    return authenticatedRequest('put', url, token)
}

export function deleteAuthenticated(url, token?: string) {
    return authenticatedRequest('delete', url, token)
}

export function authenticatedRequest(method: 'get' | 'post' | 'put' | 'delete' | 'patch', url, token?: string) {
    //@ts-ignore
    const jwt = token || global.accessToken;
    return myRequest(method, url)
        .set('authorization', 'Bearer ' + jwt);
}

export function get(url: string, prefix?: string) {
    return myRequest('get', url, prefix)
}

export function post(url) {
    return myRequest('post', url)
}

function myRequest(method: 'get' | 'post' | 'put' | 'delete' | 'patch', url: string, prefix: string = '/api/v2') {
    //@ts-ignore
    return request(global.testApp.getHttpServer())
        [method](prefix + url)
}

export function login(email, password) {
    return post('/auth/login')
        .send({
            email: email,
            password: password,
        });
}
