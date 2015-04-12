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

	//# sourceURL=testiife.js;
});
