
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
