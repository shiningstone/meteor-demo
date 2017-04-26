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

function AddUser(args) {
	if(arguments.length==2) {
		Roles.addUsersToRoles(args.user, args.roles);
	}
	else {
		Roles.addUsersToRoles(args.user, args.roles, args.groups);
	}

	return ServerFailureCode.Ok;
}

function AddProject(args) {
	var prj = args.name;

	Projects.insert({name : prj});
	
	return ServerFailureCode.Ok;
}

Meteor.methods({
	'Intf.AddUser' : Permit(AddUser,['sysAdmin']),
	'Intf.AddProject' : Permit(AddProject,['admin']),
});

