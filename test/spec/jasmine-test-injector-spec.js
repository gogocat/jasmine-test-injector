
// start jasmine unit testing
/*
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
		//rewrite(testIff);
	});
	
});
*/

$inject("http://localhost/jasmine-test-injector/js/testiife.js", function() {
	
	describe("Test $injector into IIFE script", function() {
		console.log("IIFE spec name: ", name);
		beforeEach(function(done) {
			setTimeout(function() {
				done();
			}, 100);
		});
		
		it("variable 'name' inside loaded IIFE should be === 'IIFE!' ", function(done) {
			expect(name).toBe("IIFE!");
			done();
		});
		
		//it("testModule variable 'testModuleName' inside closure should be accessible", function() {
			//expect(typeof testModuleName).toBe("undefined");
		//});
	});
	//# sourceURL=testiife.js;
});
