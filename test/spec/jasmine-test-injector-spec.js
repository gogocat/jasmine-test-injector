
// start jasmine unit testing
describe("jasmine-test-injector", function() {
	"use strict";
	
	window.testIff = '  (function($, window, document) \n { \n ';
		testIff += 'var name = "adam"; \n ';
		testIff += '}(jQuery, window, document)); ';
	
	console.log(testIff);
	
	beforeEach(function() {
		spyOn(window, "$inject");
	});
	
	it("$inject should be a global function", function() {
		expect(typeof $inject).toBe("function");
	});
	
	it("$inject should call through", function() {
		$inject();
		expect($inject).toHaveBeenCalled();
		rewriteIff(testIff);
	});
	
});

$inject("/jasmine-test-injector/js/testiife.js", function() {
	describe("Test $injector into IIFE script", function() {
		"use strict";

		it("module 'testModule' should be a global function", function() {
			//expect(typeof testModule).toBe("function");
		});
		
		it("testModule variable 'testModuleName' inside closure should be accessible", function() {
			//expect(typeof testModuleName).toBe("undefined");
		});
	});
});
