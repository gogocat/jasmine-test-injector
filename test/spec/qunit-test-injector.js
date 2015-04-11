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

	//# sourceURL=testiife.js;
});
