
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
		
		beforeEach(function(done) {
			setTimeout(function() {
				console.log("name: ", name);
				done();
			}, 1000);
		});
		
		it("variable 'name' inside loaded IIFE should be IIFE!", function(done) {
			expect(name).toBe("IIFE!");
			done();
		});
		
		it("call function add(2,2) should return 4", function(done) {
			var result = add(2,2);
			expect(result).toBe(4);
			done();
		});
		
		it("window.IIFE.sum should be 2", function(done) {
			expect(window.IIFE.sum).toBe(2);
			done();
		});
	});
	//# sourceURL=testiife.js;
});
