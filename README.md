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

1. Open up the closure (testiife.js)

2. Inject the test spec (QUnit)

3. Seal back the closure

4. Execute the test spec (running inside the closure)

**Example in Jasmine:**
```javascript
$inject.use.jasmine();

$inject("http://localhost/unit-test-injector/js/testiife.js", function() {
	describe("$injector into a IIFE script", function() {
		it("variable 'name' inside loaded IIFE should be IIFE!", function() {
			expect(name).toBe("IIFE!");
		});
	});
	//# sourceURL=testiife.js;
});
```
When using with Jasmine,  just tell $inject to use jasmine config by calling:
```javascript
$inject.use.jasmine();
```
This will set $inject to use synchronous request. This is important as Jasmine seems has issue when using asynchronous request to load and run the test spec.

The default setting for $inject is using asynchronous request and QUnit. 

**But can I use Jasmine and force to asynchronous request?**

Sure can!
```javascript
$inject.use.jasmine()
       .use.async(); 
```
However, please follow Jasmine's documentation about testing asynchronously.

**What is that line of code?  //# sourceURL=testiife.js; **

This is modern browser's feature that allow dynamic generated script to be able debug in the developer tool. 
It is not required for $inject to work, but it may handy to have this line in case you want to debug the test spec.

License
----

BSD
