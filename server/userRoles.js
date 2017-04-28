
export const UserRoles = ['SysAdmin', 'Admin', 'Maintener', 'Tester'];
UserRoles.SYS_ADMIN = UserRoles[0];
UserRoles.ADMIN = UserRoles[1];
UserRoles.MAINTENER = UserRoles[2];
UserRoles.TESTER = UserRoles[3];
UserRoles.SYS_GROUP = 'SysGroup';

UserRoles.compare = function(role_x, role_y) {
	return (UserRoles.indexOf(role_x)>UserRoles.indexOf(role_y)) ? 1 : -1;
}

UserRoles.high = function(roles) {
	if(roles instanceof Array) {
		roles.sort(UserRoles.compare);
		return roles[0];
	}
	else {
		return roles;
	}
};

UserRoles.low = function(roles) {
	if(roles instanceof Array) {
		roles.sort(UserRoles.compare);
		return roles[roles.length - 1];
	}
	else {
		return roles;
	}
};

UserRoles.isPrior = function(curs, expects) {
	return (UserRoles.compare(UserRoles.low(curs), UserRoles.high(expects))==-1);
};

UserRoles.expand = function(roles) {

};
