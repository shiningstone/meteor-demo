/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';
import { Testplans } from './../imports/api/testplans.js';
import { UserRoles } from './userRoles.js';
import { ErrCode } from './interfaces.js'

import { fakeLogin, logDescribe, logIt } from './utils.tests.js';

if (Meteor.isServer) {
	/*********************************** 
		test cases
	***********************************/
	logDescribe('Interfaces', () => {
		function createUser (name) {
			return Accounts.createUser({'username': name});
		}
			
		logDescribe('Administrator', () => {
			beforeEach(() => {
				Meteor.roles.remove({});
				Meteor.users.remove({});
				Projects.remove({});
				Testplans.remove({});
				
				Object.keys(UserRoles).map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'sysAdmin' : createUser('sysAdmin'),
					'admin': createUser('admin'),
				};

				Roles.addUsersToRoles(users.sysAdmin, [UserRoles.SYS_ADMIN], UserRoles.SYS_GROUP);
				Roles.addUsersToRoles(users.admin, [UserRoles.ADMIN], UserRoles.SYS_GROUP);
				fakeLogin(users.admin);
			});
			logDescribe('AddTestPlan', () => {
				logIt('admin is authorized to add a testplan', () => {
					var testplan = {
						name : 'test',
					};
					assert.equal(Meteor.call('Prj.AddTestplan', testplan), ErrCode.Ok);

					var results = Testplans.find({}).fetch();
					assert.equal(1, results.length);
					assert.equal('test', results[0].name);
				});
			});
			logDescribe('AssignUser', () => {
				logIt('admin is not authorized to add an user to other projects', () => {
					var illegalUser = {
						user : createUser('illegalUser'),
						roles : [UserRoles.ADMIN],
						groups : 'other project',
					};

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Sys.AddProject', prj), ErrCode.Ok);

					assert.equal(Meteor.call('Prj.AssignUser', illegalUser), ErrCode.Unauthorized);
				});
				logIt('admin is not authorized to add an user to its own project with improper role', () => {
					var illegalUser = {
						user : createUser('illegalUser'),
						roles : [UserRoles.SYS_ADMIN],
						groups : 'project',
					};

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Sys.AddProject', prj), ErrCode.Ok);
					assert.equal(Meteor.call('Prj.AssignUser', illegalUser), ErrCode.ImcompetentAuth);
				});
				logIt('admin is not authorized to add an user to its own project without specifing a group', () => {
					var legalUser2 = {
						user : createUser('legalUser2'),
						roles : [UserRoles.Maintener],
					};

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Sys.AddProject', prj), ErrCode.Ok);
					assert.equal(Meteor.call('Prj.AssignUser', legalUser2), ErrCode.InvalidParam);

					assert.equal(Roles.userIsInRole(legalUser2.user, 'Maintener'), false);
					assert.equal(Roles.userIsInRole(legalUser2.user, 'Maintener', 'project'), false);
				});
				logIt('admin is authorized to add an user to its own project with proper role', () => {
					var legalUser1 = {
						user : createUser('legalUser1'),
						roles : [UserRoles.ADMIN],
						groups : 'project',
					};

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Sys.AddProject', prj), ErrCode.Ok);
					assert.equal(Meteor.call('Prj.AssignUser', legalUser1), ErrCode.Ok);

					assert.equal(Roles.userIsInRole(legalUser1.user, 'Admin'), false);
					assert.equal(Roles.userIsInRole(legalUser1.user, 'Admin', 'project'), true);
				});
			});

			logDescribe('AddProject', () => {
				logIt('admin is not authorized to remove others\' project', () => {
					var prj1 = {name: 'project1'};
					Projects.insert(prj1);

					assert.equal(Meteor.call('Sys.RemoveProject', prj1), ErrCode.Unauthorized);
				});
				logIt('admin is authorized to remove specifed project', () => {
					var prj1 = {name: 'project1', creator:Meteor.userId()};
					var prj2 = {name: 'project2', creator:Meteor.userId()};
					assert.equal(Meteor.call('Sys.AddProject', prj1), ErrCode.Ok);
					assert.equal(Meteor.call('Sys.AddProject', prj2), ErrCode.Ok);
					assert.equal(Meteor.call('Sys.RemoveProject', prj1), ErrCode.Ok);

					var results = Projects.find({}).fetch();
					assert.equal(1, results.length);
					assert.equal('project2', results[0].name);
				});
				logIt('admin is authorized to remove project', () => {
					var prj1 = {name: 'project1', creator:Meteor.userId()};
					assert.equal(Meteor.call('Sys.AddProject', prj1), ErrCode.Ok);
					assert.equal(Meteor.call('Sys.RemoveProject', prj1), ErrCode.Ok);

					var results = Projects.find({}).fetch();
					assert.equal(0, results.length);
				});
				logIt('non-admin is not authorized to add project', () => {
					var otherUser = createUser('otherUser');
					fakeLogin(otherUser);

					var prj = {name: 'project'};
					assert.equal(Meteor.call('Sys.AddProject', prj), ErrCode.Unauthorized);
				});
				logIt('admin is authorized to add project', () => {
					var prj = {name: 'project'};
					assert.equal(Meteor.call('Sys.AddProject', prj), ErrCode.Ok);

					var results = Projects.find({}).fetch();
					assert.equal(1, results.length);
					assert.equal('project', results[0].name);
				});
				logIt('admin is unauthorized to add project', () => {
					Roles.removeUsersFromRoles(users.admin, [UserRoles.ADMIN], UserRoles.SYS_GROUP);
					
					var prj = {name: 'project'};
					assert.equal(Meteor.call('Sys.AddProject', prj), ErrCode.Unauthorized);
				});
			});
		});
		logDescribe('System administrator', () => {
			logDescribe('AssignUserToAdmin', () => {
				beforeEach(() => {
					Meteor.roles.remove({});
					Meteor.users.remove({});
					
					Object.keys(UserRoles).map(function(role) {
						Roles.createRole(role);
					});
					
					users = {
						'sysAdmin': createUser('sysAdmin'),
						'admin' : createUser('admin'),
					};
				});

				logIt('non-sysAdmin is not authorized to AddUser', () => {
					var newuser = { user: users.sysAdmin, roles: [UserRoles.ADMIN], groups: UserRoles.SYS_GROUP};
					assert.equal(Meteor.call('Sys.AssignUserToAdmin', newuser), ErrCode.Unauthorized);
				});
				logIt('sysAdmin is authorized to AddUser', () => {
					Roles.addUsersToRoles(users.sysAdmin, [UserRoles.SYS_ADMIN], UserRoles.SYS_GROUP);
					fakeLogin(users.sysAdmin);

					var newuser = { user: users.sysAdmin, roles: [UserRoles.ADMIN], groups: UserRoles.SYS_GROUP};
					assert.equal(Meteor.call('Sys.AssignUserToAdmin', newuser), ErrCode.Ok);
				});
				logIt('sysAdmin is unauthorized to AddUser', () => {
					Roles.addUsersToRoles(users.sysAdmin, [UserRoles.SYS_ADMIN], UserRoles.SYS_GROUP);
					Roles.removeUsersFromRoles(users.sysAdmin, [UserRoles.SYS_ADMIN], UserRoles.SYS_GROUP);
					fakeLogin(users.sysAdmin);

					var newuser = { user: users.sysAdmin, roles: [UserRoles.ADMIN], groups: UserRoles.SYS_GROUP};
					assert.equal(Meteor.call('Sys.AssignUserToAdmin', newuser), ErrCode.Unauthorized);
				});
			});
		});
	});
}
