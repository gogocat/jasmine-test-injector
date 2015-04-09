
// start jasmine unit testing
/*
describe("jasmine-test-injector", function() {
	"use strict";
	
	var value = 0;
	
	beforeEach(function(done) {
		spyOn(window, "$inject");
		 setTimeout(function() {
		  value += 1;
		  done();
		}, 1);
	});
	
	it("Asyn test value should greater than 0", function(done) {
		expect(value).toBeGreaterThan(0);
		done();
	});
	
	it("$inject should be a global function", function() {
		expect(typeof $inject).toBe("function");
	});
	
	it("$inject should call through", function() {
		$inject();
		expect($inject).toHaveBeenCalled();
	});
	
});

*/

$inject("http://localhost/jasmine-test-injector/js/testiife.js", function() {
	
	describe("Test $injector into IIFE script", function() {
		beforeEach(function(done) {
			setTimeout(function() {
				done();
			}, 1);
		});
		it("variable 'name' inside loaded IIFE should be IIFE!", function(done) {
			expect(name).toBe("IIFE!");
			done();
		});
		it("window.IIFE.sum should be 2", function(done) {
			expect(window.IIFE.sum).toBe(2);
			done();
		});
		//it("testModule variable 'testModuleName' inside closure should be accessible", function() {
			//expect(typeof testModuleName).toBe("undefined");
		//});
	});
	//# sourceURL=testiife.js;
});
