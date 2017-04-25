
export const ServerFailureCode = {
	Ok : 0,
	Unauthorized : 1,
	InvalidParam : 2,
};

export function Permit(method, role, groupCheckFlag) {
	return function(x) {
		if(groupCheckFlag && Roles.userIsInRole(Meteor.userId(), role, x.project)) {
			return method(x);
		}
		else if(!groupCheckFlag && Roles.userIsInRole(Meteor.userId(), role)) {
			return method(x);
		}
		else {
			return ServerFailureCode.Unauthorized;
		}
	}
}