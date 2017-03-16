/*
*	$inject.js
*	Inject test spec script into closure
*/
(function(env) {
'use strict';

var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	REGEX_LINEBREAKS = /(\r\n|\n|\r)/gm,
	// auto execute the spec stored in testSpecs and provide a magic link - allow caller from outside closure to call function inside the closure
	testSpecRunner = function(index) {
		var ret =	'\n (function() { eval(INJECTOR.testSpecs['+ index +']["spec"]);}());\n';
			ret += 'window._TESTSPEC' + index + '= function(fnName) { try {return eval(fnName).apply(this, Array.prototype.slice.call(arguments, 1));} catch(err) {throw err.stack;}} \n';
		return ret;
	},
	removeLineBreak = false,
	isAsync = false,
	isCache = true,
	isDebug = true,
	replaceToken = '//@TEST',
	loadCount = 0;
	
env.INJECTOR = env.INJECTOR || {};
env.INJECTOR.testSpecs = env.INJECTOR.testSpecs || [];

/**
 * getFnBodyString
 * @description convert function body to string
 * @param {function} fn 
 * @returns 
 */
function getFnBodyString(fn) {
    if (typeof fn !== 'function') {
        return '';
    }
    return getIIFBody(fn.toString());
}

/**
 * getIIFBody
 * @description strip IIF and return function content as string
 * @param {string} fnString 
 * @returns 
 */
function getIIFBody(fnString) {
	var fnBody;
		
	if (typeof fnString !== 'string') {
		return '';
	}
	fnBody = fnString.substring(fnString.indexOf('{') + 1, fnString.lastIndexOf('}'));
	return fnBody.trim();
}

/**
 * isObject
 * @description simple check if value is an object
 * @param {any} obj
 * @returns {boolean}
 */
function isObject(obj) {
	return obj != null && Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Inject
 * @description Inject constructor
 * @param {string} uri 
 * @param {function} callback 
 * @returns 
 */
function Inject(uri, callback) {
	var self = this;

	self.use = useInterface(self);
	self.constructor = Inject;
	self.replaceToken = replaceToken;
	self.removeLineBreak = removeLineBreak;
	self.isAsync = isAsync;
	self.injections = {};

	if (typeof uri !== 'string') {
		return;
	}
	if (typeof callback === 'function') {
		self.injections[replaceToken] = callback;
	} 
	else if (isObject(callback)) {
		self.injections = callback;
	}
	return self.fetch(uri, self.injections);
}

Inject.prototype = {
	/**
	 * rewriteByToken
	 * @description rewrite function content and replace token with test spec
	 * @param {string} responseText
	 * @param {string} token
	 * @param {number} specIndex
	 * @return {string} rewritten function content
	 */
	rewriteByToken: function(responseText, token, specIndex) {
		var self = this,
			fnText = '',
			ret = '';

		token = (typeof token === 'string') ? token : '';
			
		if (typeof responseText !== 'string' || typeof specIndex === 'undefined') {
			return ret;
		}
		
		fnText = responseText.trim();

		// remove line breaks - !!some badly formatted script could cause parser error
		if (self.removeLineBreak) {
			fnText = fnText.replace(REGEX_LINEBREAKS,'');  
		}
		// replace token with test spec
		ret = fnText.replace(token, testSpecRunner(specIndex));

		// ret is the target test script plus injected spec function string
		return ret;
	},

	/**
	 * fetch
	 * @description ajax load script as text
	 * @param {string} uri
	 * @param {object} injections - this is the test spec as {'//@TEST': orginalSpecFn, ...}
	 * @return {object} executed XMLHttpRequest
	 */
	fetch: function (uri, injections) {
		var self = this,
			specIndex = 0,
			key;
		
		if (typeof uri !== 'string' || !isObject(injections)) {
			throw  new TypeError('uri should be string, injections should be a plain object');
		}
		// TODO: move this out to other function, make it loop over injections for each callback
		// store callback function (original test spec) as string in INJECTOR.testSpecs array
		// [{token:'//@TEST', spec: fn}, ...]
		for (key in injections) {
			if (injections.hasOwnProperty(key)) {
				env.INJECTOR.testSpecs.push({
					token: key,
					spec: getFnBodyString(injections[key])
				});
			}
		}
		//env.INJECTOR.testSpecs.push(getFnBodyString(callback));
		//specIndex = env.INJECTOR.testSpecs.length - 1;
		
		return (function(config) {
			var httpReq = new XMLHttpRequest(),
				reqUri = config.uri;

			httpReq.onreadystatechange = function(e) {
				var rewrittenScriptSource;
				try {
					if (httpReq.readyState === XMLHttpRequest.DONE) {
						if (httpReq.status === 200 || httpReq.status === 304) {
							//console.log(httpReq.responseText);
							
							rewrittenScriptSource = httpReq.responseText;
							// loop each testSpecs and replace each token in the source file
							env.INJECTOR.testSpecs.forEach(function(value, index) {
								rewrittenScriptSource = self.rewriteByToken(rewrittenScriptSource, value.token, index);
							});
							
							if (rewrittenScriptSource) {
								self.addJS('injectedTestSource-' + loadCount, rewrittenScriptSource);
								loadCount += 1;
								// debug
								if (isDebug) {
									console.log('rewritten script: ', rewrittenScriptSource);
								}
								return;
							}
						} else {
							throw (new Error(httpReq.status)).stack;
						}
					}
				}
				catch(err) {
					throw 'Caught Exception: ' + err;
				}
			};

			if (!config.cache) {
				reqUri = config.uri + '?' + new Date().getTime();
			}

			httpReq.open('GET', reqUri, config.async);
			httpReq.send();
		}({
			uri: uri,
			async: self.isAsync,
			cache: isCache
		}));
	},
	/**
	 * addJS
	 * @description add script to HEAD
	 * @param {number} id
	 * @param {string} source - script content
	 */
	addJS: function(id, source) {
		var domHead,
			newScript;

		if (typeof source !== 'string' || document.getElementById(id)) {
			return;
		}
		
		domHead = document.getElementsByTagName('HEAD').item(0);
		newScript = document.createElement('script');
		newScript.language = 'javascript';
		newScript.type = 'text/javascript';
		newScript.id = id;
		newScript.defer = true;
		newScript.text = source;
		domHead.appendChild(newScript);
    }
};

/**
 * use
 * @description This is a share object to overwrite global settings
 */
function useInterface(instance) {
	return {
		debug: function(debug) {
			// change global isDebug setting
			isDebug =  (typeof debug === 'boolean') ? debug : false;
			return instance;
		},
		async: function(async) {
			instance.isAsync =  (typeof async === 'boolean') ? async : false;
			return instance;
		},
		token: function(tokenString) {
			if (typeof tokenString === 'string') {
				instance.replaceToken = tokenString;
			}
			return instance;
		},
		removeLineBreak: function(isRemoveLineBreak) {
			instance.removeLineBreak = (typeof isRemoveLineBreak === 'boolean') ? isRemoveLineBreak : true;
			return instance;
		}
	};
}


// expose $inject to global 
env.$inject = function(uri, callback) {
	return new Inject(uri, callback);
};
env.$inject.use = use;

}(window));