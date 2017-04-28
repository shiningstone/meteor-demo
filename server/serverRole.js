
export const ServerRole = {
	/*system roles*/
	SysAdmin : { name:'SysAdmin', level:0 },
	Admin : { name:'Admin', level:1 },
	/*project roles*/
	Creator : { name:'Creator', level:2 },
	Maintener : { name:'Maintener', level:3 },
	Tester : { name:'Tester', level:4 },
};

ServerRole.SysGroup = 'SysGroup';

/************************************************************************************************** 
	Note : 
		The following 2 interfaces are adaptors to package alaning:Roles, please make sure
		the roles are 'packed' before entering ServerRole module, and 'unpacked' before entering
		alaning:Roles
**************************************************************************************************/
ServerRole.pack = function(roleName) {
	for(var n in ServerRole) {
		if(roleName==n) {
			return ServerRole[n];
		}
	}
};

ServerRole.unpack = function(roles) {
	var roleNames = [];
	for(var i=0; i<roles.length; i++) {
		roleNames.push(roles[i].name);
	}
	return roleNames;
};

ServerRole.compare = function(role_x, role_y) {
	return (role_x.level>role_y.level) ? 1 : -1;
}

ServerRole.high = function(roles) {
	if(roles instanceof Array) {
		roles.sort(ServerRole.compare);
		return roles[0];
	}
	else {
		return roles;
	}
};

ServerRole.low = function(roles) {
	if(roles instanceof Array) {
		roles.sort(ServerRole.compare);
		return roles[roles.length - 1];
	}
	else {
		return roles;
	}
};

ServerRole.isPrior = function(curs, expects) {
	return (ServerRole.compare(ServerRole.low(curs), ServerRole.high(expects))==-1);
};

ServerRole.expand = function(roles) {

};
