
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { ServerFailureCode, ServerRole } from './interfaces.js';
import { Permission, ParamLimit } from './permission.js';

function fakeLogin(userId) {
	Meteor.userId = function() {
		return userId;
	};
}

var logDescribe = function(desc, func) {
	console.log(desc);
	describe(desc, func);
};
var logIt = function(desc, func) {
	console.log('\t' + desc);
	it(desc, func);
};

logDescribe('Permission', () => {
	logIt('deny function when parameter not satisfied', ()=> {
		var limit = new ParamLimit();
		var testfunc = Permission(function() {return true;}, [limit]);
		assert.equal(testfunc(), ServerFailureCode.InvalidParam);
	})
	logIt('call function directly when no limitation imposed', ()=> {
		var testfunc = Permission(function() {return true;});
		assert.equal(testfunc(), true);

		testfunc = Permission(function() {return false});
		assert.equal(testfunc(), false);

		testfunc = Permission(function(x) {return x});
		assert.equal(testfunc(1), 1);
	})
});