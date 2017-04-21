/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { permissionCtrl } from './permissionCtrl.js';

const ServerFailureCode = {
	Ok : 0,
	Unauthorized : 1,
	InvalidParam : 2,
};

if (Meteor.isServer) {
	var TesterInputParams = {};
	Meteor.methods({
		'Tester.SysAdminOp'() {
			if(Roles.userIsInRole(Meteor.userId(), ['sysAdmin']))
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		
		'Tester.AdminOp'(prj) {
			if(Roles.userIsInRole(Meteor.userId(), ['admin']))
			{
				TesterInputParams = prj;
				return true;
			}
			else
			{
				return false;
			}
		},
		
		'Tester.DevOp'(prj, station) {
		
		},
		
		'Tester.TestOp'(prj, station) {
		
		},
	});
	
	function fakeLogin(userId) {
		Meteor.userId = function() {
			return userId;
		};
	}
	
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
				assert.equal(Meteor.call('Tester.SysAdminOp'), false);
			});
			it('sysAdmin is authorized to SysAdminOp', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin'])
				assert.equal(Meteor.call('Tester.SysAdminOp'), true);
			});
			it('sysAdmin is unauthorized to SysAdminOp', () => {
				Roles.addUsersToRoles(users.sysAdmin, ['sysAdmin'])
				Roles.removeUsersFromRoles(users.sysAdmin, ['sysAdmin'])
				assert.equal(Meteor.call('Tester.SysAdminOp'), false);
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
				assert.equal(Meteor.call('Tester.AdminOp'), false);
			});
			it('admin is authorized to AdminOp', () => {
				Roles.addUsersToRoles(users.admin, ['admin'])
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Tester.AdminOp', prj), true);
				assert.deepEqual(TesterInputParams, prj);
			});
			it('admin is unauthorized to AdminOp', () => {
				Roles.addUsersToRoles(users.admin, ['admin'])
				Roles.removeUsersFromRoles(users.admin, ['admin'])
				
				var prj = {name: 'project'};
				assert.equal(Meteor.call('Tester.AdminOp', prj), false);
			});
		});
	});
}
