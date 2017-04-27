import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';
import { Testplans } from './../imports/api/testplans.js';

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
		else if(Roles.userIsInRole(Meteor.userId(), [ServerRole.SysAdmin], ServerRole.SysGroup)) {
			Roles.addUsersToRoles(args.user, args.roles, args.groups);
			return ServerFailureCode.Ok;
		}
		else {
			return ServerFailureCode.Unauthorized;
		}
	}
	else {
		return ServerFailureCode.InvalidParam;
	}
}

function AddProject(args) {
	Projects.insert(args);
	Roles.addUsersToRoles(Meteor.userId(), ['Admin'], args.name);

	return ServerFailureCode.Ok;
}

function RemoveProject(args) {
	var prj = args.name;

	var result = Projects.find({name : prj}).fetch();
	if(result[0].creator===Meteor.userId()) {
		Projects.remove({name : prj});
		return ServerFailureCode.Ok;
	}
	else
	{
		return ServerFailureCode.Unauthorized;
	}
}

function AddTestplan(args) {
	var testplan = args.name;

	Testplans.insert({name : testplan});

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
	'Sys.AssignUserToAdmin' : Permit(AssignUserToAdmin, [ServerRole.SysAdmin]),
	'Sys.AddProject' : Permit(AddProject, [ServerRole.SysAdmin, ServerRole.Admin]),
	'Sys.RemoveProject' : Permit(RemoveProject, [ServerRole.SysAdmin, ServerRole.Admin]),
	/* projects management */
	'Prj.AssignUser' : Permit(AssginUser, [ServerRole.SysAdmin, ServerRole.Admin]),
	'Prj.AddTestplan' : Permit(AddTestplan, [ServerRole.SysAdmin, ServerRole.Admin, ServerRole.Maintener]),
});

