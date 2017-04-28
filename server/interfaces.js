import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Projects } from './../imports/api/projects.js';
import { Testplans } from './../imports/api/testplans.js';

import { UserRoles, SysAdmin, Admin, Maintener, Tester } from './userRoles.js';
import { Permission, RequireParam, RequireUser } from './permission.js';

export const ErrCode = {
	Ok : 0,
	Unauthorized : 1,
	ImcompetentAuth : 2,
	InvalidParam : 3,
};

Meteor.methods({
	/* system management */
	'Sys.AssignUserToAdmin' : Permission(AssignUserToAdmin, 
		[], 
		[new RequireUser([UserRoles.SYS_ADMIN])]),

	'Sys.AddProject' : Permission(AddProject, 
		[new RequireParam(['name'])], 
		[new RequireUser([UserRoles.ADMIN])]),
	
	'Sys.RemoveProject' : Permission(RemoveProject, 
		[new RequireParam(['name'])], 
		[new RequireUser([UserRoles.ADMIN])]),
	
	/* projects management */
	'Prj.AssignUser' : Permission(AssginUser, 
		[new RequireParam(['groups'])], 
		[new RequireUser([UserRoles.ADMIN], 'RequireGroup')]),
	
	'Prj.AddTestplan' : Permission(AddTestplan, 
		[], 
		[new RequireUser([UserRoles.MAINTENER])]),
});


function AssignUserToAdmin(args) {
	Roles.addUsersToRoles(args.user, [UserRoles.ADMIN], UserRoles.SYS_GROUP);
	return ErrCode.Ok;
}

function AssginUser(args) {
	var actRoles = Roles.getRolesForUser(Meteor.userId(), args.groups);

	if(UserRoles.isPrior(actRoles, args.roles)) {
		Roles.addUsersToRoles(args.user, args.roles, args.groups);
		return ErrCode.Ok;
	}
	else {
		return ErrCode.ImcompetentAuth;
	}
}

function AddProject(args) {
	Projects.insert(args);
	Roles.addUsersToRoles(Meteor.userId(), [UserRoles.ADMIN], args.name);

	return ErrCode.Ok;
}

function RemoveProject(args) {
	var prj = args.name;

	var result = Projects.find({name : prj}).fetch();
	if(result[0].creator===Meteor.userId()) {
		Projects.remove({name : prj});
		return ErrCode.Ok;
	}
	else
	{
		return ErrCode.Unauthorized;
	}
}

function AddTestplan(args) {
	var testplan = args.name;

	Testplans.insert({name : testplan});

	return ErrCode.Ok;
}
