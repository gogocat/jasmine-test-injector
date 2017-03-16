/*
*	Qunit test
*	
*/
// setup $inject default token
$inject.use.token("//TESTTOKEN");


QUnit.test( "$inject should be a global function", function( assert ) {
	assert.ok(typeof $inject === "function", "defined" );
});


// version 3.1.0
// allow multiple $inject token in one test source

$inject("http://localhost:5151/unit-test-injector/js/testiife.js", {
	'//@token1': function () {
		QUnit.test("Test //@token1 token variable 'innerClosureName' is accessable", function(assert) {
				assert.ok(innerClosureName, 'This is innerClosure');
				assert.ok(sayHi(), 'Hello This is innerClosure');
		});
		//# sourceURL=token1.js;
	},
	'//@token2': function () {
		QUnit.test("Test //@token2 token variable 'secret' is 123", function(assert) {
				assert.ok(secret, 123);
		});
		//# sourceURL=token2.js;
	},
	'//TESTTOKEN': function() {
		QUnit.test( "variable 'name' inside loaded IIFE should be ", function( assert ) {
			assert.ok(name === "IIFE!", "IIFE!" );
		});
		
		QUnit.test("call function add(2,2) should return 4", function(assert) {
			var result = add(2,2);
			assert.ok(result === 4, "4");
		});
		
		QUnit.test("call function times should return value 4", function(assert) {
			var timesResult = times(2,2);
			assert.ok(timesResult === 4, "number 4");
		});
		
		QUnit.test("window.IIFE.sum should be 2", function(assert) {
			assert.ok(window.IIFE.sum === 2, "number 2");
		});

		//# sourceURL=testiife.js;
	}
});

// test public scope using _TESTSPEC helper to call private methods
QUnit.test("call private method 'sayHi' should be 'Hello This is innerClosure'", function(assert) {
	assert.ok(window._TESTSPEC0('sayHi'), 'Hello This is innerClosure');
});

QUnit.test("call private method 'times(4,6)' should be 24", function(assert) {
	assert.ok(window._TESTSPEC2('times', 4,6), 24);
});