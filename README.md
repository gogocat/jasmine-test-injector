# Unit test injector

A script injector for running unit test inside closure or module. 

Unlike dependence injection(DI), which unable access the caller's scope.  $inject actually inject and run testing spec script inside the closure. 

Now testing private properties and methods is possible!

The script is designed to works for any javascript unit testing framework including Jasmine and QUnit. It support extension via a 'strategy' setting.

**Example in QUnit:**

```javascript
$inject("http://localhost/unit-test-injector/js/testiife.js", function() {
	QUnit.test( "variable 'name' inside loaded IIFE should be ", function( assert ) {
		assert.ok(name === "IIFE!", "IIFE!" );
	});
	//# sourceURL=testiife.js;
});
```
**What is happening in this code...**
$injector is the global function which use jQuery to load the Qunit test script and then:
1. Open up the closure
2. Inject the test spec
3. Seal back the closure
4. Execute the test spec

-- TBA


License
----

BSD
