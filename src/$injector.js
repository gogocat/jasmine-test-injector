/*
*	$inject.js
*	Inject script into closure
*/
(($, env) => {

'use strict';

var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	REGEX_LINEBREAKS = /(\r\n|\n|\r)/gm,
	REGEX_TRIM = /^\s+|\s+$/g,
	//REGEX_IIFHEAD = /^.*?\(\s*function\s*[^\(]*\(\s*([^\)]*)\)\s*\{/m,
	removeLineBreak = false,
	isAsync = false,
	replaceToken = '//TESTTOKEN',
	_TESTSPEC = ` 
		window._TESTSPEC = function(fnName) { 
			try {return eval(fnName).apply(this, Array.prototype.slice.call(arguments, 1));} 
			catch(err) {throw err.stack;}
		}`,
	testSpecRunner = `\n 
		var _TESTSPECFN = function() {
			eval(INJECTOR.testSpecs['+ index +']);
		}; 
		_TESTSPECFN(); \n`;
	
env.INJECTOR = env.INJECTOR || {};
env.INJECTOR.testSpecs = env.INJECTOR.testSpecs || [];

// convert function body to string
function getFnBodyString(fn) {
    var ret = '';
	if (typeof fn !== 'function') {
        return ret;
    }
    let fnString = fn.toString();
	let fnText = '';
	let fnBody = fnString.substring(fnString.indexOf('{') + 1, fnString.lastIndexOf('}'));
	fnText = fnBody.replace(REGEX_COMMENTS, '').replace(REGEX_TRIM, '');
	return fnText;
}

class Inject {
	constructor (uri, callback) {
		if (typeof uri === 'string' && typeof callback === 'function') {
			return this.fetch(uri, callback);
		}
		return this;
	}

	fetch (uri, callback) {
		if (typeof uri !== 'string' || typeof callback !== 'function') {
			throw  'fetch: invalid arguments';
		}

		env.INJECTOR.testSpecs.push(getFnBodyString(callback));
		
		return $.ajax({
			url: uri,
			type: 'GET',
			dataType: 'script',
			async: isAsync,
			cache:true,
			crossDomain: false,
			dataFilter: (responseText, dataType) => {
				if (replaceToken) {
					return this.rewriteByToken(responseText, dataType);
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				throw errorThrown;
			}
		});
	}
	
	rewriteByToken (responseText, dataType) {
		var fnText,
			index = env.INJECTOR.testSpecs.length - 1,
			ret = '';
			
		if (typeof responseText !== 'string') {
			return ret;
		}
		// use qunit as default
		if (!testSpecRunner) {
			use.qunit();
		}
		fnText = responseText;
		fnText = $.trim(fnText); // trim
		//fnText = fnText.replace(REGEX_COMMENTS, ''); // remove comments
		
		// remove line breaks - !!some bad formatted script will cause parser error
		if (removeLineBreak) {
			fnText = fnText.replace(REGEX_LINEBREAKS,' ');  
		}
		ret = fnText.replace(replaceToken, testSpecRunner(index));
		return ret;
	}
}

// use object for chainable config setting
let use = {
	token: function(tokenString) {
		if (typeof tokenString === 'string') {
			replaceToken = tokenString;
		}
		return env.$inject;
	},
	removeLineBreak: function(isRemoveLineBreak) {
		removeLineBreak = (typeof isRemoveLineBreak === 'boolean') ? isRemoveLineBreak : true;
		return env.$inject;
	},
	async: function(useAsync) {
		isAsync = (typeof useAsync === 'boolean') ? useAsync : true;
		return env.$inject;
	}
};

// expose $inject to global 
env.$inject = (uri, callback) => new Inject(uri, callback);

env.$inject.use = use;

})(jQuery, typeof window !== 'undefined' ? window : this);
