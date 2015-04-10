/*
*	$inject.js
*	Inject script into closure
*/
(function($, env) {
"use strict";

var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	testSpecCount = 0;
	
env.INJECTOR = env.INJECTOR || {};
env.INJECTOR.testSpecs = env.INJECTOR.testSpecs || [];

// convert function body to string
function getFnBodyString(fn) {
    var fnString,
        fnBody;
    
    if (typeof fn !== "function") {
        return "";
    }
    fnString = fn.toString();
    fnBody = fnString.substring(fnString.indexOf("{") + 1, fnString.lastIndexOf("}"));
    return fnBody;
}

function getIIFHead(fnString) {
	var ret = "";
	if (typeof fnString !== "string") {
		return ret;
	}
	ret = fnString.match(/^.*\(\s*function\s*[^\(]*\(\s*([^\)]*)\)\s*\{/m);
	return ret;
}

function getIIFBody(fnString) {
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


function rewrite(responseText, dataType) {
	var fnText,
		iifHeadArray,
		iifBody,
		iifEnd,
		iifHead,
		index = 0,
		ret = "";
	if (typeof responseText !== "string") {
		return ret;
	}
	if (testSpecCount) {
		index = testSpecCount - 1;
	}
	fnText = responseText;
	fnText = $.trim(fnText); // trim
	fnText = fnText.replace(REGEX_COMMENTS, ""); // remove comments
	fnText = fnText.replace(/(\r\n|\n|\r)/gm," ");  // remove line breaks
	iifHeadArray = getIIFHead(fnText);
	

	if (iifHeadArray && iifHeadArray.length) {
		iifBody = fnText.replace(iifHeadArray[0], "");
		iifHead = iifHeadArray[0];
		iifHead += "\n var testSpecFn = function() { eval(INJECTOR.testSpecs["+ index +"]);};";
		iifHead += "\n testSpecFn(); \n";
		ret = iifHead + iifBody;
	}
	return ret;
}

function fetch(uri, callback) {
	var request;
	
	if (typeof uri !== "string" || typeof callback !== "function") {
		throw  "fetch: invalid arguments";
	}

	env.INJECTOR.testSpecs.push(getFnBodyString(callback));
	testSpecCount += 1;

	request = $.ajax({
		url: uri,
		type: 'GET',
		dataType: "script",
		async: true,
		cache:false,
		crossDomain: false,
		dataFilter: rewrite,
		success: function(closureFn) {
			console.log(closureFn);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			throw errorThrown;
		}
	});
	
	return request;
}

function Inject(uri, callback) {
	this.fetch = fetch;
	return this.fetch(uri, callback);
}

env.$inject = function(uri, callback) {
	return new Inject(uri, callback);
};

env.getFnBodyString = getFnBodyString;

}(jQuery, typeof window !== "undefined" ? window : this));