/*
*	sample test IIFE
*	
*/
(function(document, window) {
	"use strict";
	
	var name = "IIFE!",
		sum = 0;
	
	function add(x, y) {
		return x + y;
	}
	
	function times(x, y) {
		return x * y;
	}

	sum = add(1,1);
	
	function innerClosure() {
		var innerClosureName = 'This is innerClosure';

		function sayHi () {
			return 'Hello ' + innerClosureName;
		}
		//@token1
		return  {
			getSecret: function() {
				var secret = 123;
				//@token2
				return secret;
			},
			greet: sayHi
		};
	}
	
	window.IIFE = window.IIFE || {};
	window.IIFE.sum = sum;
	window.IIFE.innerClosure = innerClosure();
	window.IIFE.innerClosure.getSecret();

	//TESTTOKEN
})(document, window);