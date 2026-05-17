// sockjs-client uses Node.js `global` which doesn't exist in browsers
(globalThis as any).global = globalThis;
