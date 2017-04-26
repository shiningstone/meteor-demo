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
	function AdminOp(prj) {
		IntfInputParams = prj;
		return ServerFailureCode.Ok;
	}
	Meteor.methods({
		'Intf.AddUser' : Permit(AddUser,['sysAdmin']),

		'Intf.AdminOp' : Permit(AdminOp,['admin']),
		'Intf.DevOp'(prj, station) {},
		'Intf.TestOp'(prj, station) {},
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
				
				roles.map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'admin': createUser('admin'),
				};
				fakeLogin(users.admin);
			});
			it('non-admin is not authorized to AdminOp', () => {
				assert.equal(Meteor.call('Intf.AdminOp'), ServerFailureCode.Unauthorized);
			});
			it('admin is authorized to AdminOp', () => {
				Roles.addUsersToRoles(users.admin, ['admin']);
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AdminOp', prj), ServerFailureCode.Ok);
				assert.deepEqual(IntfInputParams, prj);
			});
			it('admin is unauthorized to AdminOp', () => {
				Roles.addUsersToRoles(users.admin, ['admin']);
				Roles.removeUsersFromRoles(users.admin, ['admin']);
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AdminOp', prj), ServerFailureCode.Unauthorized);
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
