/*
*	$inject.js
*	Inject script into closure
*/
(function($, env) {
"use strict";

// \}.*(?:[\(.\)]).+$
var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	testSpecCount = 0,
	cache = {};
	
env.INJECTOR = env.INJECTOR || {};
env.INJECTOR.testSpecs = env.INJECTOR.testSpecs || [];

// consider to use $r.js from jsMagic
function fetch(uri, callback) {
	var request;
	
	if (typeof uri !== "string" || typeof callback !== "function") {
		throw  "fetch: invalid arguments";
	}
	
	if (cache[uri]) {
		return callback(cache[uri]);
	}
	
	testSpecCount += 1;
	env.INJECTOR.testSpecs.push(callback);

	request = $.ajax({
		url: uri,
		type: 'GET',
		dataType: "script",
		async: true,
		cache:true,
		crossDomain: false,
		dataFilter: rewriteIff,
		success: function(closureFn) {
			if(!closureFn) {
				return;
			}
			callback(closureFn);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			throw errorThrown;
		}
	});
	
	return request;
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

function rewriteIff(responseText, dataType) {
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
		iffHead += "setTimeout(function(){ try { testSpecFn = new Function(INJECTOR.testSpecs["+ index +"]); testSpecFn();} catch(err) { throw err.message;} },15); \n";
	}
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