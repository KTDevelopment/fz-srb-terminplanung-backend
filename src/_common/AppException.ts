export class AppException extends Error {

    constructor(original: Error, message?: string) {
        super(message ? `${message}: ${original.message}` : original.message);
        this.stack = combineErrorStack(this.stack, original.stack);
    }
}

function combineErrorStack(newStack: string, oldStack: string): string {
    return newStack.split('\n').slice(0,2).join('\n') + "\n" + oldStack;
}
