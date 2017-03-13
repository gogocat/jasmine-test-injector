/*
*	$inject.js
*	Inject test spec script into closure
*/
(function(env) {
"use strict";

var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	REGEX_LINEBREAKS = /(\r\n|\n|\r)/gm,
	// magic link - allow caller from outside closure to call function inside the closure
	_TESTSPEC = 'window._TESTSPEC = function(fnName) { try {return eval(fnName).apply(this, Array.prototype.slice.call(arguments, 1));} catch(err) {throw err.stack;}} \n',
	testSpecRunner = function(index) {
		var ret =	"\n var _TESTSPECFN = function() { eval(INJECTOR.testSpecs["+ index +"]);};";
			ret +=	"_TESTSPECFN(); \n";
			ret += _TESTSPEC; // expose private _TESTSPEC helper so unit test can call scripts private methods 
		return ret;
	},
	removeLineBreak = false,
	isAsync = false,
	isCache = true,
	isDebug = false,
	replaceToken = '',
	use;
	
env.INJECTOR = env.INJECTOR || {};
env.INJECTOR.testSpecs = env.INJECTOR.testSpecs || [];

/**
 * getFnBodyString
 * @description convert function body to string
 * @param {function} fn 
 * @returns 
 */
function getFnBodyString(fn) {
    if (typeof fn !== "function") {
        return "";
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
	var fnBody,
		fnText = "";
		
	if (typeof fnString !== "string") {
		return fnText;
	}
	fnBody = fnString.substring(fnString.indexOf("{") + 1, fnString.lastIndexOf("}"));
	fnText = fnBody.replace(REGEX_COMMENTS, '').trim();
	return fnText;
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
	this.constructor = Inject;

	if (typeof uri !== "string" && typeof callback !== "function") {
		return;
	}
	return self.fetch(uri, callback);
}

Inject.prototype = {
	/**
	 * rewriteByToken
	 * @description rewrite function content and replace token with test spec
	 * @param {string} responseText
	 * @param {number} specIndex
	 * @return {string} rewritten function content
	 */
	rewriteByToken: function(responseText, specIndex) {
		var self = this,
			fnText,
			ret = "";
			
		if (typeof responseText !== "string") {
			return ret;
		}
		fnText = responseText;
		fnText = fnText.trim();

		// remove line breaks - !!some bad formatted script will cause parser error
		if (removeLineBreak) {
			fnText = fnText.replace(REGEX_LINEBREAKS," ");  
		}
		// replace token with test spec
		ret = fnText.replace(replaceToken, testSpecRunner(specIndex));

		if (isDebug) {
			console.log('rewritten script: ', ret);
		}
		// ret is the target test script plus injected spec function string
		return ret;
	},

	/**
	 * fetch
	 * @description ajax load script as text
	 * @param {string} uri
	 * @param {function} callback - this is the test spec
	 * @return {object} executed XMLHttpRequest
	 */
	fetch: function (uri, callback) {
		var self = this,
			specIndex = 0;
		
		if (typeof uri !== "string" || typeof callback !== "function") {
			throw  "fetch: invalid arguments";
		}
		// store callback function (original test spec) as string in INJECTOR.testSpecs array
		env.INJECTOR.testSpecs.push(getFnBodyString(callback));
		specIndex = env.INJECTOR.testSpecs.length - 1;
		
		return (function(config) {
			var httpReq = new XMLHttpRequest(),
				reqUri = config.uri;

			httpReq.onreadystatechange = function(e) {
				var rewrittenScriptSource;
				try {
					if (httpReq.readyState === XMLHttpRequest.DONE) {
						if (httpReq.status === 200 || httpReq.status === 304) {
							//console.log(httpReq.responseText);
							rewrittenScriptSource = self.rewriteByToken(httpReq.responseText, config.testSpecIndex);
							if (rewrittenScriptSource) {
								return self.addJS('testSpec-' + config.testSpecIndex, rewrittenScriptSource);
							}
						} else {
							// pass e.target.status, e.target.statusText to onError callbackFn
							//console.log(e.target.status, e.target.statusText);
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

			httpReq.open('GET', reqUri, config.cache);
			httpReq.send();
		}({
			uri: uri,
			async: isAsync,
			cache: isCache,
			testSpecIndex: specIndex
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
		newScript.type = "text/javascript";
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
use = {
	debug: function(debug) {
		isDebug =  (typeof debug === "boolean") ? debug : false;
	},
	token: function(tokenString) {
		var self = this;
		if (typeof tokenString === "string") {
			replaceToken = tokenString;
		}
		return env.$inject;
	},
	removeLineBreak: function(isRemoveLineBreak) {
		var self = this;
		removeLineBreak = (typeof isRemoveLineBreak === "boolean") ? isRemoveLineBreak : true;
		return env.$inject;
	}
};

// expose $inject to global 
env.$inject = function(uri, callback) {
	return new Inject(uri, callback);
};
env.$inject.use = use;

}(window));