
// start jasmine unit testing

describe("jasmine-test-injector", function() {
	"use strict";
	
	beforeEach(function() {
		spyOn(window, "$inject");
	});
	
	it("$inject should be a global function", function() {
		expect(typeof $inject).toBe("function");
	});
	
	it("$inject should call through", function() {
		$inject();
		expect($inject).toHaveBeenCalled();
	});
	
});


$inject("http://localhost/jasmine-test-injector/js/testiife.js", function() {

	describe("Test $injector into IIFE script", function() {
		console.log("IIFE spec name: ", name);
		console.log("test: ", asdfsadfsadf);
		// jasmine eats all the error therefore nothing seems happening
		it("variable 'name' inside loaded IIFE should be IIFE!", function() {
			console.log("window.IIFE.sum: ", window.IIFE.sum);
			expect(window.IIFE.sum).toBe(2);
			//expect(name).toBe("IIFE!");
		});
		//it("testModule variable 'testModuleName' inside closure should be accessible", function() {
			//expect(typeof testModuleName).toBe("undefined");
		//});
	});
	//# sourceURL=testiife.js;
});
