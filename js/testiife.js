/*
*	sample test IIFE
*	
*/
(function(document, window) {
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
	
	var testSpecFn = function() { 
		eval(INJECTOR.testSpecs[0]);
	}; 
	testSpecFn(); 
	
})(document, window);