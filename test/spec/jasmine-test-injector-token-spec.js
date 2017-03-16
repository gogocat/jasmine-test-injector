
// start jasmine unit testing

// setup $inject default token
$inject.use.token("//TESTTOKEN");

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


// version 3.1.0
// allow multiple $inject token in one test source

$inject("http://localhost:5151/unit-test-injector/js/testiife.js", {
	'//@token1': function () {
		describe("Test //@token1 token", function() {
			it("variable 'innerClosureName' is accessable", function() {
				expect(innerClosureName).toBe('This is innerClosure');
				expect(sayHi()).toBe('Hello This is innerClosure');
			});
		});
		//# sourceURL=token1.js;
	},
	'//@token2': function () {
		describe("Test //@token2 token", function() {
			it("variable 'secret' is accessable", function() {
				expect(secret).toBe(123);
			});
		});
		//# sourceURL=token2.js;
	},
	'//TESTTOKEN': function() {
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
		//# sourceURL=TESTTOKEN.js;
	}
});

// test public scope using _TESTSPEC helper to call private methods
describe("Test window._TESTSPEC private method helper", function() {

	it("call private method 'sayHi' should be 'Hello This is innerClosure'", function() {
		expect(window._TESTSPEC0('sayHi')).toBe('Hello This is innerClosure');
	});

	it("call private method 'times(4,6)' should be 24", function() {
		expect(window._TESTSPEC2('times', 4,6)).toBe(24);
	});

});



