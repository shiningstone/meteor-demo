
import { Meteor } from 'meteor/meteor';

export function fakeLogin(userId) {
	Meteor.userId = function() {
		return userId;
	};
}

export const logDescribe = function(desc, func) {
	describe(desc, function() {
		console.log('====================== ' + desc + ' ======================');
		func();
	});
};

export const logIt = function(desc, func) {
	it(desc, function() {
		console.log('\t' + '----' + desc + '----------------------');
		func();
	});
};
