export async function promiseAllSequentially<I, O>(array: I[], callback: (single: I) => Promise<O>): Promise<O[]> {
    const results: O[] = [];

    const last = await array.reduce(async (previousPromise, single) => {
        results.push(await previousPromise);
        return callback(single);
    }, Promise.resolve({} as O));

    results.push(last);
    return results.slice(1);
}
