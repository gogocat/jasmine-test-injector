'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
*	$inject.js
*	Inject script into closure
*/
(function ($, env) {

	'use strict';

	var REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
	    REGEX_LINEBREAKS = /(\r\n|\n|\r)/gm,
	    REGEX_TRIM = /^\s+|\s+$/g,

	//REGEX_IIFHEAD = /^.*?\(\s*function\s*[^\(]*\(\s*([^\)]*)\)\s*\{/m,
	_removeLineBreak = false,
	    isAsync = false,
	    replaceToken = '//TESTTOKEN',
	    _TESTSPEC = ' \n\t\twindow._TESTSPEC = function(fnName) { \n\t\t\ttry {return eval(fnName).apply(this, Array.prototype.slice.call(arguments, 1));} \n\t\t\tcatch(err) {throw err.stack;}\n\t\t}',
	    testSpecRunner = '\n \n\t\tvar _TESTSPECFN = function() {\n\t\t\teval(INJECTOR.testSpecs[\'+ index +\']);\n\t\t}; \n\t\t_TESTSPECFN(); \n';

	env.INJECTOR = env.INJECTOR || {};
	env.INJECTOR.testSpecs = env.INJECTOR.testSpecs || [];

	// convert function body to string
	function getFnBodyString(fn) {
		var ret = '';
		if (typeof fn !== 'function') {
			return ret;
		}
		var fnString = fn.toString();
		var fnText = '';
		var fnBody = fnString.substring(fnString.indexOf('{') + 1, fnString.lastIndexOf('}'));
		fnText = fnBody.replace(REGEX_COMMENTS, '').replace(REGEX_TRIM, '');
		return fnText;
	}

	var Inject = function () {
		function Inject(uri, callback) {
			_classCallCheck(this, Inject);

			if (typeof uri === 'string' && typeof callback === 'function') {
				return this.fetch(uri, callback);
			}
			return this;
		}

		_createClass(Inject, [{
			key: 'fetch',
			value: function fetch(uri, callback) {
				var _this = this;

				if (typeof uri !== 'string' || typeof callback !== 'function') {
					throw 'fetch: invalid arguments';
				}

				env.INJECTOR.testSpecs.push(getFnBodyString(callback));

				return $.ajax({
					url: uri,
					type: 'GET',
					dataType: 'script',
					async: isAsync,
					cache: true,
					crossDomain: false,
					dataFilter: function dataFilter(responseText, dataType) {
						if (replaceToken) {
							return _this.rewriteByToken(responseText, dataType);
						}
					},
					error: function error(jqXHR, textStatus, errorThrown) {
						throw errorThrown;
					}
				});
			}
		}, {
			key: 'rewriteByToken',
			value: function rewriteByToken(responseText, dataType) {
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
				if (_removeLineBreak) {
					fnText = fnText.replace(REGEX_LINEBREAKS, ' ');
				}
				ret = fnText.replace(replaceToken, testSpecRunner(index));
				return ret;
			}
		}]);

		return Inject;
	}();

	// use object for chainable config setting


	var use = {
		token: function token(tokenString) {
			if (typeof tokenString === 'string') {
				replaceToken = tokenString;
			}
			return env.$inject;
		},
		removeLineBreak: function removeLineBreak(isRemoveLineBreak) {
			_removeLineBreak = typeof isRemoveLineBreak === 'boolean' ? isRemoveLineBreak : true;
			return env.$inject;
		},
		async: function async(useAsync) {
			isAsync = typeof useAsync === 'boolean' ? useAsync : true;
			return env.$inject;
		}
	};

	// expose $inject to global
	env.$inject = function (uri, callback) {
		return new Inject(uri, callback);
	};

	env.$inject.use = use;
})(jQuery, typeof window !== 'undefined' ? window : undefined);