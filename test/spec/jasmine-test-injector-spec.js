
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
	
	it("property 'test' inside closure should be able read", function() {
		
	});
	
	it("function 'A' inside closure should be able to call through", function() {
		
	});

});

describe("Test $injector into object with modular pattern", function() {
	"use strict";

	it("module 'testModule' should be a global function", function() {
		//expect(typeof testModule).toBe("function");
	});
	
	it("testModule variable 'testModuleName' inside closure should be accessible", function() {
		//expect(typeof testModuleName).toBe("undefined");
	});
	
});
