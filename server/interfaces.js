import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';
import { Testplans } from './../imports/api/testplans.js';
import { Permission, RequireParam, RequireUser } from './permission.js';

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

ServerRole.expand = function(roles) {

};

function AssignUserToAdmin(args) {
	Roles.addUsersToRoles(args.user, [ServerRole.Admin], ServerRole.SysGroup);
	return ServerFailureCode.Ok;
}

function AssginUser(args) {
	var actRoles = Roles.getRolesForUser(Meteor.userId(), args.groups);
	if(ServerRole.isPrior(actRoles, args.roles)) {
		Roles.addUsersToRoles(args.user, args.roles, args.groups);
		return ServerFailureCode.Ok;
	}
	else {
		return ServerFailureCode.ImcompetentAuth;
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

Meteor.methods({
	/* system management */
	'Sys.AssignUserToAdmin' : Permission(AssignUserToAdmin, 
		[], 
		[new RequireUser([ServerRole.SysAdmin])]),

	'Sys.AddProject' : Permission(AddProject, 
		[new RequireParam(['name'])], 
		[new RequireUser([ServerRole.Admin])]),
	
	'Sys.RemoveProject' : Permission(RemoveProject, 
		[new RequireParam(['name'])], 
		[new RequireUser([ServerRole.Admin])]),
	
	/* projects management */
	'Prj.AssignUser' : Permission(AssginUser, 
		[new RequireParam(['groups'])], 
		[new RequireUser([ServerRole.Admin], 'testgroup')]),
	
	'Prj.AddTestplan' : Permission(AddTestplan, 
		[], 
		[new RequireUser([ServerRole.Maintener])]),
});

