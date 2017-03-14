
// start jasmine unit testing
// test $inject lib exist
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

// setup $inject to use jasmine
$inject.use.token("//TESTTOKEN");


// use $inject to load source script and run test at private scope
$inject("http://localhost:5151/unit-test-injector/js/testiife.js", function() {
	
	describe("Test $injector into IIFE script", function() {

		it("variable 'name' inside loaded IIFE should be IIFE!", function() {
			expect(name).toBe("IIFE!");
		});
		
		it("call function add(2,2) should return 4", function() {
			var result = add(2,2);
			expect(result).toBe(4);
		});
		
		it("window.IIFE.sum should be 2", function() {
			expect(window.IIFE.sum).toBe(2);
		});
	});
	//# sourceURL=testiife.js;
});

// test public scope using _TESTSPEC helper to call private methods
describe("Test window._TESTSPEC private method helper", function() {

	it("call private method 'times(4,6)' should be 24", function() {
		expect(window._TESTSPEC('times', 4,6)).toBe(24);
	});

});

/*
// version 2 
// allow multiple $inject token in one test source

$inject("http://localhost:5151/unit-test-injector/js/testiife.js", {
	'token1': function sepc1(helper) {
		...
		expect(helper('times', 4,6)).toBe(24);
	},
	'token2': function sepc2(helper) {
		...
		expect(helper('times', 4,6)).toBe(24);
	},
});

*/