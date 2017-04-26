/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';

import { ServerFailureCode, Permit } from './permissionCtrl.js';


if (Meteor.isServer) {
	/*********************************** 
		stubs for test (interface sample)
	***********************************/
	var TesterInputParams = {};
	function AddUser(args) {
		/*jiangbo : 
			this is a bad usage of arguments, I want more specific formal paramters table, but I don't know how
		*/
		var user = args[0];
		var roles = args[1];
		var groups = args[2];

		if(arguments.length==2) {
			Roles.addUsersToRoles(user, roles);
		}
		else {
			Roles.addUsersToRoles(user, roles, groups);
		}

		return ServerFailureCode.Ok;
	}
	function AddProject(args) {
		var prj = args[0];

		Projects.insert({name : prj.name});
		
		return ServerFailureCode.Ok;
	}

	Meteor.methods({
		'Intf.AddUser' : Permit(AddUser,['sysAdmin']),
		'Intf.AddProject' : Permit(AddProject,['admin']),
	});
	
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

				var prj = [{name: 'project'}];
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Unauthorized);
			});
			it('admin is authorized to AddProject', () => {
				var prj = [{name: 'project'}];
				assert.equal(Meteor.call('Intf.AddProject', prj), ServerFailureCode.Ok);

				var results = Projects.find({}).fetch();
				assert.equal(1, results.length);
				assert.equal('project', results[0].name);
			});
			it('admin is unauthorized to AddProject', () => {
				Roles.removeUsersFromRoles(users.admin, ['admin']);
				
				var prj = [{name: 'project'}];
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
				var newuser = [users.admin, ['admin']];
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Unauthorized);
			});
			it('sysAdmin is authorized to AddUser', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin']);
				fakeLogin(users.sysAdmin);

				var newuser = [users.admin, ['admin']];
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Ok);
			});
			it('sysAdmin is unauthorized to AddUser', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin']);
				Roles.removeUsersFromRoles(users.sysAdmin, ['sysAdmin']);
				fakeLogin(users.sysAdmin);

				var newuser = [users.admin, ['admin']];
				assert.equal(Meteor.call('Intf.AddUser', newuser), ServerFailureCode.Unauthorized);
			});
		});
	});
}
