
import { Meteor } from 'meteor/meteor';

export function fakeLogin(userId) {
	Meteor.userId = function() {
		return userId;
	};
}

export const logDescribe = function(desc, func) {
	console.log(desc);
	describe(desc, func);
};

export const logIt = function(desc, func) {
	console.log('\t' + desc);
	it(desc, func);
};
