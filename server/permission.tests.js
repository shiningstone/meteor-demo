
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';


import { ServerRole } from './serverRole.js';
import { ErrCode } from './interfaces.js';
import { Permission, RequireParam, RequireUser } from './permission.js';

import { fakeLogin, logDescribe, logIt } from './utils.tests.js';

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

			Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin.name], ServerRole.SysGroup);
			Roles.addUsersToRoles(users.admin, [ServerRole.Admin.name], ServerRole.SysGroup);
		});

		logIt('admin check with group', ()=> {
			Roles.addUsersToRoles(users.admin, [ServerRole.Admin.name], 'testgroup');
			var limit = new RequireUser([ServerRole.Admin], 'RequireGroup');
			var testfunc = Permission(function() {return ErrCode.Ok;}, [], [limit]);

			fakeLogin(users.admin);

			assert.equal(testfunc({groups:'testgroup'}), ErrCode.Ok);
			assert.equal(testfunc(), ErrCode.InvalidParam);
			assert.equal(testfunc({groups:'badgroup'}), ErrCode.Unauthorized);
		});
		logIt('admin check', ()=> {
			var limit = new RequireUser([ServerRole.Admin]);
			var testfunc = Permission(function() {return ErrCode.Ok;}, [], [limit]);

			fakeLogin(users.sysAdmin);
			assert.equal(testfunc(), ErrCode.Ok);

			fakeLogin(users.admin);
			assert.equal(testfunc(), ErrCode.Ok);
		});
		logIt('sysadmin check', ()=> {
			var limit = new RequireUser([ServerRole.SysAdmin]);
			var testfunc = Permission(function() {return ErrCode.Ok;}, [], [limit]);

			fakeLogin(users.sysAdmin);
			assert.equal(testfunc(), ErrCode.Ok);

			console.log('sysadmin check------------------------------');
			fakeLogin(users.admin);
			assert.equal(testfunc(), ErrCode.Unauthorized);
		});
	});
	logDescribe('parameter check', () => {
		logIt('deny function when multiple parameters not satisfied', ()=> {
			var limit = new RequireParam(['name', 'project']);
			var testfunc = Permission(function() {return ErrCode.Ok;}, [limit]);

			assert.equal(testfunc({name: 'test1'}), ErrCode.InvalidParam);
			assert.equal(testfunc({name: 'test1', project:'test2'}), ErrCode.Ok);
		});
		logIt('deny function when parameter not satisfied', ()=> {
			var limit = new RequireParam(['name']);
			var testfunc = Permission(function() {return ErrCode.Ok;}, [limit]);
			
			assert.equal(testfunc(), ErrCode.InvalidParam);
			assert.equal(testfunc({name: 'test1'}), ErrCode.Ok);
			assert.equal(testfunc({name: 'test2'}), ErrCode.Ok);

			limit = new RequireParam(['project']);
			testfunc = Permission(function() {return ErrCode.Ok;}, [limit]);
			assert.equal(testfunc({project: 'test1'}), ErrCode.Ok);
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