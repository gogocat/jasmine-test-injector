/*
*	Qunit test
*	
*/
// setup $inject to use Qunit
$inject.use.qunit();


QUnit.test( "$inject should be a global function", function( assert ) {
	assert.ok(typeof $inject === "function", "defined" );
});


$inject("http://localhost/jasmine-test-injector/js/testiife.js", function() {
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
});
