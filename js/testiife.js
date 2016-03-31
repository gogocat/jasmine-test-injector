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
	window.IIFE = window.IIFE || {};
	window.IIFE.sum = sum;
	
	//TESTTOKEN

})(document, window);