/*
*	$inject.js
*	Inject script into closure
*/
(function($, env) {
"use strict";

// \}.*(?:[\(.\)]).+$
var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	cache = {};
	
env.INJECTOR = env.INJECTOR || {};
env.INJECTOR.testSpecs = env.INJECTOR.testSpecs || [];

// consider to use $r.js from jsMagic
function fetch(uri, callback) {
	var isAsync = (typeof callback === "function"),
		request,
		wrapScript,
		ret;
	
	if (typeof uri !== "string") {
		throw  "script url is undefined";
	}
	
	if (cache[uri]) {
		return callback(cache[uri]);
	}

	wrapScript = function(responseText, dataType) {
		var closureFn,
			closureFnText,
			source;
			
		// TODO: seal closure
		if (responseText) {	
			closureFnText = '\n \n';
			closureFnText += responseText;
			closureFnText += '\n //# sourceURL='+ uri;
			closureFn = new Function(closureFnText);
			cache[uri] = source = closureFn(); // Make the closureFn
			return source;
		} 
		return null;
	};

	request = $.ajax({
		url: uri,
		type: 'GET',
		dataType: "script",
		async: isAsync,
		cache:true,
		crossDomain: false,
		dataFilter: wrapScript,
		success: function(closureFn) {
			if(!closureFn) {
				return;
			}
			if (isAsync) {
				callback(closureFn);
			} else {
				ret = closureFn;
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			throw errorThrown;
		}
	});
	
	return (isAsync) ? request : ret;
}
	
 
// convert function body to string
function getFnBodyString(fn) {
    var fnString,
        fnBody;
    
    if (typeof fn !== "function") {
        return;
    }
    fnString = fn.toString();
    fnBody = fnString.substring(fnString.indexOf("{") + 1, fnString.lastIndexOf("}"));
    return fnBody;
}

function getIffHead(fnString) {
	var ret = "";
	if (typeof fnString !== "string") {
		return ret;
	}
	ret = fnString.match(/^.*\(\s*function\s*[^\(]*\(\s*([^\)]*)\).*\{/m);
	return ret;
}

function getIffBody(fnString) {
	var fnBody,
		fnText,
		ret = "";
	if (typeof fnString !== "string") {
		return ret;
	}
	fnBody = fnString.substring(fnString.indexOf("{") + 1, fnString.lastIndexOf("}"));
	fnText = fnBody.replace(REGEX_COMMENTS, '').replace(/^\s+|\s+$/g, '');
	return fnText;
}

/*
function IffBody(fnString) {
	var fnBody = fnString.substring(fnString.indexOf("{") + 1, fnString.lastIndexOf("}")),
		fnText = fnBody.replace(REGEX_COMMENTS, '').replace(/^\s+|\s+$/g, ''),
		iffArgs = fnText.match(/\}.*(?:[\(.\)]).+$/g), 	// \}(?=[^\}]*$).+$
		args = fnText.match(/^.*\(function\s*[^\(]*\(\s*([^\)]*)\)/m),
    iffhead,
    newiff;
		
	console.log("fnText: ", fnText);
	console.log("args: ", args);
	console.log("iffArgs: ", iffArgs);
  
  iffhead = args[0] + "\n testRunner()\n";
  
  newiff = fnText.replace(args[0], iffhead);
  
  console.log("newiff: ", newiff);
}
*/

function rewriteIff(responseText, testSpec) {
	var fnText,
		iffHead,
		iffBody,
		iffEnd,
		ret = "";
	if (typeof responseText !== "string") {
		return ret;
	}
	fnText = responseText;
	fnText = $.trim(fnText); // trim
	fnText = fnText.replace(REGEX_COMMENTS, ""); // remove comments
	fnText = fnText.replace(/(\r\n|\n|\r)/gm," ");  // remove line breaks
	iffHead = getIffHead(fnText);

	if (iffHead && iffHead.length) {
		iffBody = fnText.replace(iffHead[0], "");
		
		console.log("iffHead: ", iffHead);
		console.log("iffBody: ", iffBody);
		console.log("fnText: ", fnText);
		iffHead += "var testSpecFn; \n";
		iffHead += "setTimeout(function(){ try { testSpecFn = new Function(testSpec); testSpecFn();} catch(err) { throw err.message;} },15); \n";
	}
	/*
	var testSpecFn;
	setTimeout(function(){ try { testSpecFn = new Function(testSpec); testSpecFn();} catch(err) { throw err.message;} },15);
	*/
	//fnText += responseText;
	//fnText += '\n //# sourceURL='+ uri;
}

function Inject(uri, callback) {
	this.fetch = fetch;
} 

env.$inject = function(uri, callback) {
	return new Inject(uri, callback);
};

//Debug
env.rewriteIff = rewriteIff;

}(jQuery, typeof window !== "undefined" ? window : this));