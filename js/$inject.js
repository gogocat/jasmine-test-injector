/*
*	$inject.js
*	Inject script into closure
*/
(function($, env) {
"use strict";

var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	testSpecCount = 0,
	cache = {};
	
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
		iifArgs = fnText.match(/\}.*(?:[\(.\)]).+$/g), 	// \}(?=[^\}]*$).+$
		args = fnText.match(/^.*\(function\s*[^\(]*\(\s*([^\)]*)\)/m),
    iifhead,
    newiif;
		
	console.log("fnText: ", fnText);
	console.log("args: ", args);
	console.log("iifArgs: ", iifArgs);
  
  iifhead = args[0] + "\n testRunner()\n";
  
  newiif = fnText.replace(args[0], iifhead);
  
  console.log("newiif: ", newiif);
}
*/

function rewriteIff(responseText, dataType) {
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
	iifHeadArray = getIffHead(fnText);
	

	if (iifHeadArray && iifHeadArray.length) {
		iifBody = fnText.replace(iifHeadArray[0], "");
		iifHead = iifHeadArray[0];
		console.log("iifHead: ", iifHeadArray);
		console.log("iifBody: ", iifBody);
		console.log("fnText: ", fnText);
		
		iifHead += "\n var testSpecFn; \n";
		iifHead += "setTimeout(function(){ \n";
		iifHead += "	try { \n";
		iifHead += "		testSpecFn = new Function(INJECTOR.testSpecs["+ index +"]); \n";
		iifHead += "		testSpecFn(); \n";
		iifHead += "	} catch(err) { throw err.message;\n ";
		iifHead += "} },15); \n";
		ret = iifHead + iifBody;
	}
	console.log(ret);
	return ret;
}


// consider to use $r.js from jsMagic
function fetch(uri, callback) {
	var request;
	
	if (typeof uri !== "string" || typeof callback !== "function") {
		throw  "fetch: invalid arguments";
	}
	
	if (cache[uri]) {
		return callback(cache[uri]);
	}

	env.INJECTOR.testSpecs.push(getFnBodyString(callback));
	testSpecCount += 1;

	request = $.ajax({
		url: uri,
		type: 'GET',
		dataType: "script",
		async: true,
		cache:true,
		crossDomain: false,
		dataFilter: rewriteIff,
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
}

env.$inject = function(uri, callback) {
	return new Inject(uri, callback);
};

//Debug
env.rewriteIff = rewriteIff;

}(jQuery, typeof window !== "undefined" ? window : this));