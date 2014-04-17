#### Atma.js Libraries

Package contains different build-types for NodeJS and Browsers 

Included libraries
- class
- include
- mask
- ruta
- arr
- utils

Included Compos
- layout


##### NodeJS
For now all builds differs in the way they export the libraries - globals, namespace(atma), or CommonJS.


```javascript

	// Namespace
	require('atma-libs');

	atma.mask
	atma.include
	atma.Class
	atma.Compo
	// ... end so on

	// CommonJS
	var libs = require('atma-libs/exports');

	libs.mask
	libs.include
	libs.Class
	libs.ruta
	// ...

	// Globals
	require('atma-libs/globals');

	mask
	include
	Class
	ruta
	// ...
```

These are minified source, to load development versions use:

```javascript
'atma-libs/index-dev'
'atma-libs/exports-dev'
'atma-libs/globals-dev'
```

##### Browser

Browser versions can be found in `browser/` directory.


----
(c) 2014 MIT - Atma.js Project
