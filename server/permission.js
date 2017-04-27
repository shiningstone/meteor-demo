
import { ServerFailureCode } from './interfaces.js';

export function RequireParam(paramDescs) {
	this.paramDescs = paramDescs;
}

RequireParam.prototype.check = function(x) {
	if(!x) {
		return ServerFailureCode.InvalidParam;
	}

	for(var i=0; i<this.paramDescs.length; i++) {
		if(!x.hasOwnProperty(this.paramDescs[i])) {
			return ServerFailureCode.InvalidParam;
		}
	}

	return ServerFailureCode.Ok;
};

export function Permission(method, paramLimits, userLimits) {
	return function(x) {
		var result;

		if(paramLimits) {
			for(var i = 0; i<paramLimits.length; i++) {
				if((result = paramLimits[i].check(x))!=ServerFailureCode.Ok) {
					return result;
				}
			}
		}

		return method(x);
	};
}

