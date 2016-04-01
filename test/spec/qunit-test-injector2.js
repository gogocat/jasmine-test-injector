/*
*	Qunit test
*	
*/
// setup $inject to use Qunit
$inject
	.use.qunit()
	.use.removeLineBreak(false);


QUnit.test( "$inject should be a global function", function( assert ) {
	assert.ok(typeof $inject === "function", "defined" );
});



$inject("http://localhost/jasmine-test-injector/js/userMaintenance.js", function() {
	QUnit.test( "getCheckboxesByIdContaining should be a function", function( assert ) {
		assert.ok(typeof getCheckboxesByIdContaining === "function", "defined" );
	});
	//# sourceURL=userMaintenance.js;
});