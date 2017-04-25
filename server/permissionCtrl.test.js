/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { ServerFailureCode, Permit } from './permissionCtrl.js';


if (Meteor.isServer) {
	/*********************************** 
		stubs for test (interface sample)
	***********************************/
	var TesterInputParams = {};
	function SysAdminOp() {
		return ServerFailureCode.Ok;
	}
	function AdminOp(prj) {
		IntfInputParams = prj;
		return ServerFailureCode.Ok;
	}
	Meteor.methods({
		'Intf.SysAdminOp' : Permit(SysAdminOp,['sysAdmin']),
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
		var roles = ['sysAdmin','admin','dev', 'test']
		
		function addUser (name) {
			return Accounts.createUser({'username': name})
		}
	
		describe('System administrator', () => {
			beforeEach(() => {
				Meteor.roles.remove({})
				Meteor.users.remove({})
				
				roles.map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'sysAdmin': addUser('sysAdmin'),
				}
				fakeLogin(users.sysAdmin)
			});
			it('non-sysAdmin is not authorized to SysAdminOp', () => {
				assert.equal(Meteor.call('Intf.SysAdminOp'), ServerFailureCode.Unauthorized);
			});
			it('sysAdmin is authorized to SysAdminOp', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin'])
				assert.equal(Meteor.call('Intf.SysAdminOp'), ServerFailureCode.Ok);
			});
			it('sysAdmin is unauthorized to SysAdminOp', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin'])
				Roles.removeUsersFromRoles(users.sysAdmin, ['sysAdmin'])
				assert.equal(Meteor.call('Intf.SysAdminOp'), ServerFailureCode.Unauthorized);
			});
		});
		describe('Administrator', () => {
			beforeEach(() => {
				Meteor.roles.remove({})
				Meteor.users.remove({})
				
				roles.map(function(role) {
					Roles.createRole(role);
				});
				
				users = {
					'admin': addUser('admin'),
				}
				fakeLogin(users.admin)
			});
			it('non-admin is not authorized to AdminOp', () => {
				assert.equal(Meteor.call('Intf.AdminOp'), ServerFailureCode.Unauthorized);
			});
			it('admin is authorized to AdminOp', () => {
				Roles.addUsersToRoles(users.admin, ['admin'])
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AdminOp', prj), ServerFailureCode.Ok);
				assert.deepEqual(IntfInputParams, prj);
			});
			it('admin is unauthorized to AdminOp', () => {
				Roles.addUsersToRoles(users.admin, ['admin'])
				Roles.removeUsersFromRoles(users.admin, ['admin'])
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Intf.AdminOp', prj), ServerFailureCode.Unauthorized);
			});
		});
	});
}
