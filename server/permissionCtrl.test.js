/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';

import { Permit } from './permissionCtrl.js';
import { ServerFailureCode, ServerRole } from './interfaces.js'

if (Meteor.isServer) {
	function fakeLogin(userId) {
		Meteor.userId = function() {
			return userId;
		};
	}
	
	var logIt = function(desc, func) {
		console.log(desc);
		it(desc, func);
	};
	/*********************************** 
		test cases
	***********************************/
	describe('ServerRole', () => {
		logIt('ServerRole choose high', () => {
			var a = [ServerRole.SysAdmin, ServerRole.Admin];
			assert.equal(ServerRole.high(a), ServerRole.SysAdmin);

			a = [ServerRole.Admin, ServerRole.SysAdmin];
			assert.equal(ServerRole.high(a), ServerRole.SysAdmin);

			a = [ServerRole.Admin, ServerRole.Maintener];
			assert.equal(ServerRole.high(a), ServerRole.Admin);
		});
		logIt('ServerRole choose low', () => {
			var a = [ServerRole.SysAdmin, ServerRole.Admin];
			assert.equal(ServerRole.low(a), ServerRole.Admin);

			a = [ServerRole.Admin, ServerRole.SysAdmin];
			assert.equal(ServerRole.low(a), ServerRole.Admin);

			a = [ServerRole.Admin, ServerRole.Maintener];
			assert.equal(ServerRole.low(a), ServerRole.Maintener);
		});
	});

	describe('PermissionCtrl', () => {
		function createUser (name) {
			return Accounts.createUser({'username': name});
		}
			
		describe('Administrator', () => {
			beforeEach(() => {
				Meteor.roles.remove({});
				Meteor.users.remove({});
				Projects.remove({});
				
				Object.keys(ServerRole).map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'sysAdmin' : createUser('sysAdmin'),
					'admin': createUser('admin'),
				};

				Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin]);
				Roles.addUsersToRoles(users.admin, [ServerRole.Admin]);
				fakeLogin(users.admin);
			});
			logIt('admin is not authorized to add an user to its own project with improper role', () => {
				var illegalUser = {
					user : createUser('illegalUser'),
					roles : [ServerRole.SysAdmin],
				};

				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);
				assert.equal(Meteor.call('Intf.AddUser', illegalUser), ServerFailureCode.Unauthorized);
			});
			logIt('admin is not authorized to add an user to its own project without specifing a group', () => {
				var legalUser2 = {
					user : createUser('legalUser2'),
					roles : [ServerRole.Maintener],
				};

				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);
				assert.equal(Meteor.call('Intf.AddUser', legalUser2), ServerFailureCode.InvalidParam);

				assert.equal(Roles.userIsInRole(legalUser2.user, legalUser2.roles), false);
				assert.equal(Roles.userIsInRole(legalUser2.user, legalUser2.roles, 'project'), false);
			});
			logIt('admin is authorized to add an user to its own project with proper role', () => {
				var legalUser1 = {
					user : createUser('legalUser1'),
					roles : [ServerRole.Admin],
					groups : 'project',
				};

				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);
				assert.equal(Meteor.call('Intf.AddUser', legalUser1), ServerFailureCode.Ok);

				assert.equal(Roles.userIsInRole(legalUser1.user, legalUser1.roles), false);
				assert.equal(Roles.userIsInRole(legalUser1.user, legalUser1.roles, 'project'), true);
			});
			logIt('non-admin is not authorized to AddProject', () => {
				var otherUser = createUser('otherUser');
				fakeLogin(otherUser);

				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Unauthorized);
			});
			logIt('admin is authorized to AddProject', () => {
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);

				var results = Projects.find({}).fetch();
				assert.equal(1, results.length);
				assert.equal('project', results[0].name);
			});
			logIt('admin is unauthorized to AddProject', () => {
				Roles.removeUsersFromRoles(users.admin, [ServerRole.Admin]);
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Unauthorized);
			});
		});

		describe('System administrator', () => {
			beforeEach(() => {
				Meteor.roles.remove({});
				Meteor.users.remove({});
				
				Object.keys(ServerRole).map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'sysAdmin': createUser('sysAdmin'),
					'admin' : createUser('admin'),
				};
			});

			logIt('non-sysAdmin is not authorized to AddUser', () => {
				var newuser = { user: users.sysAdmin, roles: [ServerRole.Admin]};
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Unauthorized);
			});
			logIt('sysAdmin is authorized to AddUser', () => {
				Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin]);
				fakeLogin(users.sysAdmin);

				var newuser = { user: users.sysAdmin, roles: [ServerRole.Admin]};
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Ok);
			});
			logIt('sysAdmin is unauthorized to AddUser', () => {
				Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin]);
				Roles.removeUsersFromRoles(users.sysAdmin, [ServerRole.SysAdmin]);
				fakeLogin(users.sysAdmin);

				var newuser = { user: users.sysAdmin, roles: [ServerRole.Admin]};
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Unauthorized);
			});
		});
	});
}
