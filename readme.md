# roy-web-sandbox

> sandbox environment where running javascript in browser

## Build Setup

``` bash
# install dependencies
npm install

# build for development
npm run dev

# build for production
npm run build
```

## Install

```bash
npm install --save roy-web-sandbox
```

## Usage

```javascript
import sandboxManager from 'roy-web-sandbox';

const sandbox = sandboxManager.create(`
window.a = 10;
console.log(window.a);
`);

sandbox.mount();  // 10
console.log(window.a); // undefined

```
