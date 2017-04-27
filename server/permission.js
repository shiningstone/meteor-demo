
import { ServerFailureCode } from './interfaces.js';

export function ParamLimit() {
}

ParamLimit.prototype.check = function() {
	return ServerFailureCode.InvalidParam;
};

export function Permission(method, limitations) {
	return function(x) {
		var result;

		if(limitations) {
			for(var i = 0; i<limitations.length; i++) {
				if((result = limitations[i].check(x))!=ServerFailureCode.Ok) {
					return result;
				}
			}
		}

		return method(x);
	};
}
