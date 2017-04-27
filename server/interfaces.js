import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';

export const ServerFailureCode = {
	Ok : 0,
	Unauthorized : 1,
	ImcompetentAuth : 2,
	InvalidParam : 3,
};

export const ServerRole = {
	/*system roles*/
	SysAdmin : 'SysAdmin',
	Admin : 'Admin',
	/*project roles*/
	Creator : 'Creator',
	Maintener : 'Maintener',
	Tester : 'Tester',
};

ServerRole.SysGroup = 'SysGroup';

ServerRole.level = function(role) {
	switch(role) {
		case 'SysAdmin': return 0;
		case 'Admin': return 1;
		case 'Maintener': return 2;
		case 'Tester': return 3;
		default: return 4;
	}
}

ServerRole.compare = function(x, y) {
	return (ServerRole.level(x)>ServerRole.level(y)) ? 1 : -1;
}

ServerRole.high = function(roles) {
	roles.sort(ServerRole.compare);
	return roles[0];
};

ServerRole.low = function(roles) {
	roles.sort(ServerRole.compare);
	return roles[roles.length - 1];
};

ServerRole.isPrior = function(cur, expect) {
	return (ServerRole.compare(ServerRole.low(cur), ServerRole.high(expect))==-1);
};

function AssignUserToAdmin(args) {
	Roles.addUsersToRoles(args.user, [ServerRole.Admin], ServerRole.SysGroup);
	return ServerFailureCode.Ok;
}

function AssginUser(args) {
	if(args.groups) {
		if(Roles.userIsInRole(Meteor.userId(), [ServerRole.SysAdmin, ServerRole.Admin], ServerRole.SysGroup)) {
			if(Roles.userIsInRole(Meteor.userId(), [ServerRole.Admin], args.groups)) {
				var curRoles = Roles.getRolesForUser(Meteor.userId(), ServerRole.SysGroup);

				if(ServerRole.isPrior(curRoles, args.roles)) {
					Roles.addUsersToRoles(args.user, args.roles, args.groups);
					return ServerFailureCode.Ok;
				}
				else {
					return ServerFailureCode.ImcompetentAuth;
				}
			}
			else {
				return ServerFailureCode.Unauthorized;
			}
		}
		else {
			return ServerFailureCode.Unauthorized;
		}
	}
	else {
		return ServerFailureCode.InvalidParam;
	}
}

function AddUser(args) {
	var curRoles = Roles.getRolesForUser(Meteor.userId());

	if(ServerRole.isPrior(curRoles, args.roles))
	{
		if(!ServerRole.isPrior(curRoles, [ServerRole.SysAdmin])) {
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
		return ServerFailureCode.ImcompetentAuth;
	}
}

function AddProject(args) {
	var prj = args.name;

	Projects.insert({name : prj});
	Roles.addUsersToRoles(Meteor.userId(), ['Admin'], prj);

	return ServerFailureCode.Ok;
}

function Permit(method, role) {
	return function(x) {
		if(Roles.userIsInRole(Meteor.userId(), role, ServerRole.SysGroup)) {
			return method(x);
		}
		else {
			return ServerFailureCode.Unauthorized;
		}
	}
}

Meteor.methods({
	/* system management */
	'Intf.AssignUserToAdmin' : Permit(AssignUserToAdmin, [ServerRole.SysAdmin]),
	'Intf.AddProject' : Permit(AddProject, [ServerRole.SysAdmin, ServerRole.Admin]),
	/* projects management */
	'Project.AssignUser' : Permit(AssginUser, [ServerRole.SysAdmin, ServerRole.Admin]),
});

