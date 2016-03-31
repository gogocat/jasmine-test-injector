
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

// setup $inject to use jasmine
$inject.use.token("//TESTTOKEN").use.jasmine();

$inject("http://localhost:5151/jasmine-test-injector/js/testiife.js", function() {
	
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
