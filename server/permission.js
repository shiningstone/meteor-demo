
import { ErrCode } from './interfaces.js';
import { UserRoles } from './userRoles.js';

export function RequireParam(paramDescs) {
	this.paramDescs = paramDescs;
}

RequireParam.prototype.check = function(x) {
	if(!x) {
		return ErrCode.InvalidParam;
	}

	for(var i=0; i<this.paramDescs.length; i++) {
		if(!x.hasOwnProperty(this.paramDescs[i])) {
			return ErrCode.InvalidParam;
		}
	}

	return ErrCode.Ok;
};

export function RequireUser(roles, isSpecGroup) {
	this.expRoles = roles;
	this.isRequireGroup = isSpecGroup;
}

RequireUser.prototype.check = function(x) {
	var actRoles;

	if(this.isRequireGroup) {
		if(x && x.hasOwnProperty('groups')) {
			actRoles = Roles.getRolesForUser(Meteor.userId(), x.groups);
		}
		else {
			return ErrCode.InvalidParam;
		}
	}
	else {
		actRoles = Roles.getRolesForUser(Meteor.userId(), UserRoles.SYS_GROUP);
	}

	if(actRoles.length>0 && UserRoles.isPrior(actRoles, this.expRoles)) {
		return ErrCode.Ok;
	}
	else {
		return ErrCode.Unauthorized;
	}
};

export function Permission(method, paramLimits, userLimits) {
	return function(x) {
		var result;

		if(paramLimits) {
			for(var i = 0; i<paramLimits.length; i++) {
				if((result = paramLimits[i].check(x))!=ErrCode.Ok) {
					return result;
				}
			}
		}

		if(userLimits) {
			for(var i = 0; i<userLimits.length; i++) {
				if((result = userLimits[i].check(x))==ErrCode.Ok) {
					return method(x);
				}
			}

			return result;
		}

		return method(x);
	};
}

