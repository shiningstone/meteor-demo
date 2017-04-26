import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';

import { Permit } from './permissionCtrl.js';

export const ServerFailureCode = {
	Ok : 0,
	Unauthorized : 1,
	InvalidParam : 2,
};

export const ServerRole = {
	SysAdmin : 'SysAdmin',
	Admin : 'Admin',
	Maintener : 'Maintener',
	Tester : 'Tester',
};

ServerRole.level = function(role) {
	switch(role) {
		case 'SysAdmin': return 0;
		case 'Admin': return 1;
		case 'Maintener': return 2;
		case 'Tester': return 3;
		default: return 4;
	}
}

ServerRole.IsPrior = function(x, y) {
	return (ServerRole.level(x)>ServerRole.level(y)) ? 1 : -1;
}

ServerRole.high = function(roles) {
	roles.sort(ServerRole.IsPrior);
	return roles[0];
};

ServerRole.low = function(roles) {
	roles.sort(ServerRole.IsPrior);
	return roles[roles.length - 1];
};

Roles.IsPrior = function(cur, expect) {
	return (ServerRole.IsPrior(ServerRole.low(cur), ServerRole.high(expect))==-1);
};

function AddUser(args) {
	var curRoles = Roles.getRolesForUser(Meteor.userId());

	if(Roles.IsPrior(curRoles, args.roles))
	{
		if(!Roles.IsPrior(curRoles, [ServerRole.SysAdmin])) {
			if(args.groups) {
				Roles.addUsersToRoles(args.user, args.roles, args.groups);
			}
			else {
				return ServerFailureCode.InvalidParam;
			}
		}
		else {
			Roles.addUsersToRoles(args.user, args.roles, args.groups);
		}

		return ServerFailureCode.Ok;
	}
	else
	{
		return ServerFailureCode.Unauthorized;
	}
}

function AddProject(args) {
	var prj = args.name;

	Projects.insert({name : prj});
	
	return ServerFailureCode.Ok;
}

Meteor.methods({
	'Intf.AddUser' : Permit(AddUser, [ServerRole.SysAdmin, ServerRole.Admin]),
	'Intf.AddProject' : Permit(AddProject, [ServerRole.Admin]),
});

