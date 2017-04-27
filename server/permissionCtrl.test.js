/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';
import { ServerFailureCode, ServerRole } from './interfaces.js'

if (Meteor.isServer) {
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
	/*********************************** 
		test cases
	***********************************/
	logDescribe('ServerRole', () => {
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
		logIt('ServerRoles compare', () => {
			assert.equal(ServerRole.isPrior([ServerRole.SysAdmin], [ServerRole.Admin]), true);
			assert.equal(ServerRole.isPrior([ServerRole.SysAdmin], [ServerRole.SysAdmin]), true);
			assert.equal(ServerRole.isPrior([ServerRole.Admin], [ServerRole.SysAdmin]), false);
		});
	});

	logDescribe('PermissionCtrl', () => {
		function createUser (name) {
			return Accounts.createUser({'username': name});
		}
			
		logDescribe('Administrator', () => {
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

				Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin], ServerRole.SysGroup);
				Roles.addUsersToRoles(users.admin, [ServerRole.Admin], ServerRole.SysGroup);
				fakeLogin(users.admin);
			});

			logDescribe('Interfaces AssignUser', () => {
				logIt('admin is not authorized to add an user to other projects', () => {
					var illegalUser = {
						user : createUser('illegalUser'),
						roles : [ServerRole.Admin],
						groups : 'other project',
					};

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);
					assert.equal(Meteor.call('Project.AssignUser', illegalUser), ServerFailureCode.Unauthorized);
				});
				logIt('admin is not authorized to add an user to its own project with improper role', () => {
					var illegalUser = {
						user : createUser('illegalUser'),
						roles : [ServerRole.SysAdmin],
						groups : 'project',
					};

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);
					assert.equal(Meteor.call('Project.AssignUser', illegalUser), ServerFailureCode.ImcompetentAuth);
				});
				logIt('admin is not authorized to add an user to its own project without specifing a group', () => {
					var legalUser2 = {
						user : createUser('legalUser2'),
						roles : [ServerRole.Maintener],
					};

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);
					assert.equal(Meteor.call('Project.AssignUser', legalUser2), ServerFailureCode.InvalidParam);

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
					assert.equal(Meteor.call('Project.AssignUser', legalUser1), ServerFailureCode.Ok);

					assert.equal(Roles.userIsInRole(legalUser1.user, legalUser1.roles), false);
					assert.equal(Roles.userIsInRole(legalUser1.user, legalUser1.roles, 'project'), true);
				});
			});

			logDescribe('Interfaces AddProject', () => {
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
					Roles.removeUsersFromRoles(users.admin, [ServerRole.Admin], ServerRole.SysGroup);
					
					var prj = {name: 'project'};
					assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Unauthorized);
				});
			});
		});
		/***********************************************************
			System administrator
		***********************************************************/
		logDescribe('System administrator', () => {
			logDescribe('Interfaces AssignUserToAdmin', () => {
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
					var newuser = { user: users.sysAdmin, roles: [ServerRole.Admin], groups: ServerRole.SysGroup};
					assert.equal(Meteor.call('Intf.AssignUserToAdmin', newuser), ServerFailureCode.Unauthorized);
				});
				logIt('sysAdmin is authorized to AddUser', () => {
					Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin], ServerRole.SysGroup);
					fakeLogin(users.sysAdmin);

					var newuser = { user: users.sysAdmin, roles: [ServerRole.Admin], groups: ServerRole.SysGroup};
					assert.equal(Meteor.call('Intf.AssignUserToAdmin', newuser), ServerFailureCode.Ok);
				});
				logIt('sysAdmin is unauthorized to AddUser', () => {
					Roles.addUsersToRoles(users.sysAdmin, [ServerRole.SysAdmin], ServerRole.SysGroup);
					Roles.removeUsersFromRoles(users.sysAdmin, [ServerRole.SysAdmin], ServerRole.SysGroup);
					fakeLogin(users.sysAdmin);

					var newuser = { user: users.sysAdmin, roles: [ServerRole.Admin], groups: ServerRole.SysGroup};
					assert.equal(Meteor.call('Intf.AssignUserToAdmin', newuser), ServerFailureCode.Unauthorized);
				});
			});
		});
	});
}
