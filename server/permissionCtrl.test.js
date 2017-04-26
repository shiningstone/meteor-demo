/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';

import { Permit } from './permissionCtrl.js';
import { ServerFailureCode} from './interfaces.js'

if (Meteor.isServer) {
	function fakeLogin(userId) {
		Meteor.userId = function() {
			return userId;
		};
	}
	
	/*********************************** 
		test cases
	***********************************/
	describe('PermissionCtrl', () => {
		var roles = ['sysAdmin','admin','dev', 'test'];

		function createUser (name) {
			return Accounts.createUser({'username': name});
		}
			
		describe('Administrator', () => {
			beforeEach(() => {
				Meteor.roles.remove({});
				Meteor.users.remove({});
				Projects.remove({});
				
				roles.map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'sysAdmin' : createUser('sysAdmin'),
					'admin': createUser('admin'),
				};

				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin']);
				Roles.addUsersToRoles(users.admin, ['admin']);
				fakeLogin(users.admin);
			});
			it('non-admin is not authorized to AddProject', () => {
				var otherUser = createUser('otherUser');
				fakeLogin(otherUser);

				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Unauthorized);
			});
			it('admin is authorized to AddProject', () => {
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);

				var results = Projects.find({}).fetch();
				assert.equal(1, results.length);
				assert.equal('project', results[0].name);
			});
			it('admin is unauthorized to AddProject', () => {
				Roles.removeUsersFromRoles(users.admin, ['admin']);
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Unauthorized);
			});
		});

		describe('System administrator', () => {
			beforeEach(() => {
				Meteor.roles.remove({});
				Meteor.users.remove({});
				
				roles.map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'sysAdmin': createUser('sysAdmin'),
					'admin' : createUser('admin'),
				};
			});

			it('non-sysAdmin is not authorized to AddUser', () => {
				var newuser = { user: users.sysAdmin, roles: 'admin'};
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Unauthorized);
			});
			it('sysAdmin is authorized to AddUser', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin']);
				fakeLogin(users.sysAdmin);

				var newuser = { user: users.sysAdmin, roles: 'admin'};
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Ok);
			});
			it('sysAdmin is unauthorized to AddUser', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin']);
				Roles.removeUsersFromRoles(users.sysAdmin, ['sysAdmin']);
				fakeLogin(users.sysAdmin);

				var newuser = { user: users.sysAdmin, roles: 'admin'};
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Unauthorized);
			});
		});
	});
}
