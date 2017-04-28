
import { assert } from 'meteor/practicalmeteor:chai';

import { UserRoles } from './userRoles.js'

import { fakeLogin, logDescribe, logIt } from './utils.tests.js';

if (Meteor.isServer) {
	logDescribe('UserRoles', () => {
		logIt('UserRoles choose high', () => {
			var a = [UserRoles.SYS_ADMIN, UserRoles.ADMIN];
			assert.equal(UserRoles.high(a), UserRoles.SYS_ADMIN);

			a = [UserRoles.ADMIN, UserRoles.SYS_ADMIN];
			assert.equal(UserRoles.high(a), UserRoles.SYS_ADMIN);

			a = [UserRoles.ADMIN, UserRoles.MAINTENER];
			assert.equal(UserRoles.high(a), UserRoles.ADMIN);
		});
		logIt('UserRoles choose low', () => {
			var a = [UserRoles.SYS_ADMIN, UserRoles.ADMIN];
			assert.equal(UserRoles.low(a), UserRoles.ADMIN);

			a = [UserRoles.ADMIN, UserRoles.SYS_ADMIN];
			assert.equal(UserRoles.low(a), UserRoles.ADMIN);

			a = [UserRoles.ADMIN, UserRoles.MAINTENER];
			assert.equal(UserRoles.low(a), UserRoles.MAINTENER);
		});
		logIt('UserRoless compare', () => {
			assert.equal(UserRoles.isPrior([UserRoles.SYS_ADMIN], [UserRoles.ADMIN]), true);
			assert.equal(UserRoles.isPrior([UserRoles.SYS_ADMIN], [UserRoles.SYS_ADMIN]), true);
			assert.equal(UserRoles.isPrior([UserRoles.ADMIN], [UserRoles.SYS_ADMIN]), false);
			assert.equal(UserRoles.isPrior(UserRoles.ADMIN, [UserRoles.SYS_ADMIN]), false);
		});
	});
}