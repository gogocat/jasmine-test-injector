/*
*	$inject.js
*	Inject script into closure
*/
(function($) {
"use strict";
var cache = {};

function Inject(){
} 

function loader(uri, callback) {
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



}(jQuery));