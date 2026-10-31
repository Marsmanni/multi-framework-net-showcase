import Main from "com/24steps/ui5sample/controller/Main.controller";

QUnit.module("Sample Main controller test");

QUnit.test("The Main controller class has a sayHello method", function (assert) {
	// as a very basic test example just check the presence of the "sayHello" method
	assert.strictEqual(typeof Main.prototype.sayHello, "function");
});
