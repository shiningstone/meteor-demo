
import { ServerFailureCode, ServerRole } from './interfaces.js';

export function RequireParam(paramDescs) {
	this.paramDescs = paramDescs;
}

RequireParam.prototype.check = function(x) {
	if(!x) {
		return ServerFailureCode.InvalidParam;
	}

	for(var i=0; i<this.paramDescs.length; i++) {
		if(!x.hasOwnProperty(this.paramDescs[i])) {
			return ServerFailureCode.InvalidParam;
		}
	}

	return ServerFailureCode.Ok;
};

export function RequireUser(roles, group) {
	this.expRoles = roles;
	this.expGroup = group;
}

RequireUser.prototype.check = function(x) {
	var actRoles;

	if(this.expGroup) {
		if(x && x.hasOwnProperty('group')) {
			actRoles = Roles.getRolesForUser(Meteor.userId(), x.group);
		}
		else {
			return ServerFailureCode.InvalidParam;
		}
	}
	else {
		actRoles = Roles.getRolesForUser(Meteor.userId(), ServerRole.SysGroup);
	}

	if(ServerRole.isPrior(actRoles, this.expRoles)) {
		return ServerFailureCode.Ok;
	}
	else {
		return ServerFailureCode.Unauthorized;
	}
};

export function Permission(method, paramLimits, userLimits) {
	return function(x) {
		var result;

		if(paramLimits) {
			for(var i = 0; i<paramLimits.length; i++) {
				if((result = paramLimits[i].check(x))!=ServerFailureCode.Ok) {
					return result;
				}
			}
		}

		if(userLimits) {
			for(var i = 0; i<userLimits.length; i++) {
				if((result = userLimits[i].check(x))==ServerFailureCode.Ok) {
					return method(x);
				}
			}

			return result;
		}

		return method(x);
	};
}

