[![GitHub release](https://img.shields.io/badge/Release-3.0.0-green.svg?style=flat-square)](https://github.com/gogocat/unit-test-injector)

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

$injector is a global function which use jQuery to load the target script and before the script execute, it does some operations to the source:

1. static  analysis the source file (testiife.js)

2. Inject the test spec by token

4. Execute the test spec (running inside the closure)

**Example in Jasmine:**
```javascript
$inject.use.token("//TESTTOKEN"); // provide the token that is in the source test file (testiife.js)

$inject("http://localhost/unit-test-injector/js/testiife.js", function() {
	describe("$injector into a IIFE script", function() {
		it("variable 'name' inside loaded IIFE should be IIFE!", function() {
			expect(name).toBe("IIFE!");
		});
	});
	//# sourceURL=testiife.js;
});
```

$inject will loads the source test file (testiife.js) synchronous. Allowing the test running runs in top down flow like normal execution order.

**What is that line of code?  //# sourceURL=testiife.js; **

This is modern browser's feature that allow dynamic generated script to be able debug in the developer tool. 
It is not required for $inject to work, but it may handy to have this line in case you want to debug the test spec.

License
----

BSD
