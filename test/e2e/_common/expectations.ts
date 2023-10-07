export function bodyMatchesObject(res, object) {
    if (res.body === undefined) throw new Error("body is empty: " + JSON.stringify(res.body));
    try {
        expect(res.body).toMatchObject(object);
    } catch (e) {
        console.log('received:', res.body);
        throw e
    }
}

export function bodyLengthGreaterOrEqual(res, length: number) {
    if (!Array.isArray(res.body)) throw new Error("body is no array: " + JSON.stringify(res.body));
    if (res.body.length < length) throw new Error("body contains only " + res.body.length + " items instead of minimum " + length);
}

export function bodyLengthEqual(res, length: number) {
    if (!Array.isArray(res.body)) throw new Error("body is no array: " + JSON.stringify(res.body));
    if (res.body.length !== length) throw new Error("body contains " + res.body.length + " items instead of expected " + length);
}

export function firstBodyItemMatchesObject(res, object) {
    bodyIsArray(res)
    bodyItemMatchesObject(res, 0, object);
}

export function noBodyItemMatchesObject(res, matcher: (value: any) => boolean) {
    bodyIsArray(res)
    res.body.forEach((_, index: number) => {
        bodyItemDoesNOTMatch(res, index, matcher);
    })
}

export function bodyItemMatchesObject(res, index, object) {
    if (res.body[index] === undefined) throw new Error("no item at index: " + index + " in body: " + JSON.stringify(res.body));
    expect(res.body[index]).toMatchObject(object);
}

export function bodyItemMatches(res, index, matcher: (value: any) => boolean) {
    bodyIsArray(res)
    if (!matcher(res.body[index])) {
        throw new Error("body item does not match: " + JSON.stringify(res.body[index]));
    }
}

export function bodyItemDoesNOTMatch(res, index, matcher: (value: any) => boolean) {
    bodyIsArray(res)
    if (matcher(res.body[index])) {
        throw new Error("body item matches but it should NOT: " + JSON.stringify(res.body[index]));
    }
}

export function bodyIsArray(res) {
    if (!Array.isArray(res.body)) throw new Error("body is no array: " + JSON.stringify(res.body));
}

export function loginResponse(res) {
    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body).toHaveProperty('refreshToken');
    expect(typeof res.body.refreshToken).toBe('string');
}
