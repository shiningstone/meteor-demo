
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { ServerFailureCode, ServerRole } from './interfaces.js';
import { Permission, RequireParam, RequireUser } from './permission.js';

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
		function createUser (name) {
			return Accounts.createUser({'username': name});
		}

		beforeEach(() => {
			Meteor.roles.remove({});
			Meteor.users.remove({});
			
			Object.keys(ServerRole).map(function(role) {
				Roles.createRole(role);
			});
			
			users = {
				'sysAdmin' : createUser('sysAdmin'),
				'admin': createUser('admin'),
			};

			Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin], ServerRole.SysGroup);
			Roles.addUsersToRoles(users.admin, [ServerRole.Admin], ServerRole.SysGroup);
		});

		logIt('admin check with group', ()=> {
			Roles.addUsersToRoles(users.admin, [ServerRole.Admin], 'testgroup');
			var limit = new RequireUser([ServerRole.Admin], 'testgroup');
			var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [], [limit]);

			fakeLogin(users.admin);

			assert.equal(testfunc({group:'testgroup'}), ServerFailureCode.Ok);
			assert.equal(testfunc(), ServerFailureCode.InvalidParam);
			assert.equal(testfunc({group:'badgroup'}), ServerFailureCode.Unauthorized);
		});
		logIt('admin check', ()=> {
			var limit = new RequireUser([ServerRole.Admin]);
			var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [], [limit]);

			fakeLogin(users.sysAdmin);
			assert.equal(testfunc(), ServerFailureCode.Ok);

			fakeLogin(users.admin);
			assert.equal(testfunc(), ServerFailureCode.Ok);
		});
		logIt('sysadmin check', ()=> {
			var limit = new RequireUser([ServerRole.SysAdmin]);
			var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [], [limit]);

			fakeLogin(users.sysAdmin);
			assert.equal(testfunc(), ServerFailureCode.Ok);

			fakeLogin(users.admin);
			assert.equal(testfunc(), ServerFailureCode.Unauthorized);
		});
	});
	logDescribe('parameter check', () => {
		logIt('deny function when multiple parameters not satisfied', ()=> {
			var limit = new RequireParam(['name', 'project']);
			var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [limit]);

			assert.equal(testfunc({name: 'test1'}), ServerFailureCode.InvalidParam);
			assert.equal(testfunc({name: 'test1', project:'test2'}), ServerFailureCode.Ok);
		});
		logIt('deny function when parameter not satisfied', ()=> {
			var limit = new RequireParam(['name']);
			var testfunc = Permission(function() {return ServerFailureCode.Ok;}, [limit]);
			
			assert.equal(testfunc(), ServerFailureCode.InvalidParam);
			assert.equal(testfunc({name: 'test1'}), ServerFailureCode.Ok);
			assert.equal(testfunc({name: 'test2'}), ServerFailureCode.Ok);

			limit = new RequireParam(['project']);
			testfunc = Permission(function() {return ServerFailureCode.Ok;}, [limit]);
			assert.equal(testfunc({project: 'test1'}), ServerFailureCode.Ok);
		});
		logIt('call function directly when no limitation imposed', ()=> {
			var testfunc = Permission(function() {return true;});
			assert.equal(testfunc(), true);

			testfunc = Permission(function() {return false});
			assert.equal(testfunc(), false);

			testfunc = Permission(function(x) {return x});
			assert.equal(testfunc(1), 1);
		});
	});
});