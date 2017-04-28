
import { assert } from 'meteor/practicalmeteor:chai';

import { ServerRole } from './serverRole.js'

import { fakeLogin, logDescribe, logIt } from './utils.tests.js';

if (Meteor.isServer) {
	logDescribe('ServerRole', () => {
		logIt('ServerRole choose high', () => {
			var a = [ServerRole.SysAdmin, ServerRole.Admin];
			assert.equal(ServerRole.high(a), ServerRole.SysAdmin);

			a = [ServerRole.Admin, ServerRole.SysAdmin];
			assert.equal(ServerRole.high(a), ServerRole.SysAdmin);

			a = [ServerRole.Admin, ServerRole.Maintener];
			assert.equal(ServerRole.high(a), ServerRole.Admin);
		});
		logIt('ServerRole choose low', () => {
			var a = [ServerRole.SysAdmin, ServerRole.Admin];
			assert.equal(ServerRole.low(a), ServerRole.Admin);

			a = [ServerRole.Admin, ServerRole.SysAdmin];
			assert.equal(ServerRole.low(a), ServerRole.Admin);

			a = [ServerRole.Admin, ServerRole.Maintener];
			assert.equal(ServerRole.low(a), ServerRole.Maintener);
		});
		logIt('ServerRoles compare', () => {
			assert.equal(ServerRole.isPrior([ServerRole.SysAdmin], [ServerRole.Admin]), true);
			assert.equal(ServerRole.isPrior([ServerRole.SysAdmin], [ServerRole.SysAdmin]), true);
			assert.equal(ServerRole.isPrior([ServerRole.Admin], [ServerRole.SysAdmin]), false);
			assert.equal(ServerRole.isPrior(ServerRole.Admin, [ServerRole.SysAdmin]), false);
		});
	});
}