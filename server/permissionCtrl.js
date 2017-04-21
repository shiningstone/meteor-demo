
export const ServerFailureCode = {
	Ok : 0,
	Unauthorized : 1,
	InvalidParam : 2,
};

export function Permit(role, method) {
	return function(x) {
		if(Roles.userIsInRole(Meteor.userId(), role))
		{
			return method(x);
		}
		else
		{
			return ServerFailureCode.Unauthorized;
		}
	}
}