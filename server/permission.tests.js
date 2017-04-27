
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { ServerFailureCode, ServerRole } from './interfaces.js';
import { Permission, RequireParam } from './permission.js';

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
	logDescribe('user role check', () => {
/*		var limit = new RequireUser([ServerRole.SysAdmin]);
		var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [limit]);
		assert.equal(testfunc(), ServerFailureCode.InvalidParam);
*/	});
	logDescribe('parameter check', () => {
		logIt('deny function when multiple parameters not satisfied', ()=> {
			var limit = new RequireParam(['name', 'project']);
			var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [limit]);

			assert.equal(testfunc({name: 'test1'}), ServerFailureCode.InvalidParam);
			assert.equal(testfunc({name: 'test1', project:'test2'}), ServerFailureCode.Ok);
		})
		logIt('deny function when parameter not satisfied', ()=> {
			var limit = new RequireParam(['name']);
			var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [limit]);
			
			assert.equal(testfunc(), ServerFailureCode.InvalidParam);
			assert.equal(testfunc({name: 'test1'}), ServerFailureCode.Ok);
			assert.equal(testfunc({name: 'test2'}), ServerFailureCode.Ok);

			limit = new RequireParam(['project']);
			testfunc = Permission(function() {return ServerFailureCode.Ok;}, [limit]);
			assert.equal(testfunc({project: 'test1'}), ServerFailureCode.Ok);
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
});