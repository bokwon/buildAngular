'use strict';
var _ = require('lodash');

/**
 * Creates and returns instance of Scope.
 * @constructor
 */
function Scope() {
	this.$$watchers = [];
	this.$$lastDirtyWatch = null;
	this.$$asyncQueue = [];
	this.$$applyAsyncQueue = [];
	this.$$applyAsyncId = null;
	this.$$postDigestQueue = [];
  this.$root = this;
	this.$$children = [];
	this.$$phase = null;
}

function initWatchVal() { }

/**
 * $watch() registers a listener callback to be executed whenever the watchExpression changes.
 * @param {string or function()} watchExpression
 * @param {function(newVal, oldVal, scope)} listener
 * @param {boolean} objectEquality
 * @returns a deregistration function for this listener
 */
Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
	var self = this;
	var watcher = {
		watchFn: watchFn,
		listenerFn: listenerFn || function(){ },
		valueEq: !!valueEq,
		last: initWatchVal
	};
	this.$$watchers.unshift(watcher);
	this.$root.$$lastDirtyWatch = null;
	return function() {
		var index = self.$$watchers.indexOf(watcher);
		if (index >= 0) {
			self.$$watchers.splice(index, 1);
			self.$root.$$lastDirtyWatch = null;
		}
	};
};

Scope.prototype.$watchGroup = function(watchFns, listenerFn) {
	var self = this;
	var newValues = new Array(watchFns.length);
	var oldValues = new Array(watchFns.length);
	var changeReactionScheduled = false;
	var firstRun = true;
	if (watchFns.length === 0) {
		var shouldCall = true;
		self.$evalAsync(function() {
			if (shouldCall) {
				listenerFn(newValues, newValues, self);	
			}
		});
		return function(){
			shouldCall = false;
		};
	}
	function watchGroupListener() {
		if (firstRun) {
			firstRun = false;
			listenerFn(newValues, newValues, self);
		} else {
			listenerFn(newValues, oldValues, self);
		}
		changeReactionScheduled = false;
	}
	var destroyFunctions = _.map(watchFns, function(watchFn, i) {
		return self.$watch(watchFn, function(newValue, oldValue) {
			newValues[i] = newValue;
			oldValues[i] = oldValue;
			if (!changeReactionScheduled) {
				changeReactionScheduled = true;
				self.$evalAsync(watchGroupListener);
			}
		});
	});
	return function() {
		_.forEach(destroyFunctions, function(destroyFunction) {
			destroyFunction();
		});
	};
};

Scope.prototype.$$digestOnce = function() {
	var dirty;
	var continueLoop = true;
	var self = this;
	this.$$everyScope(function(scope){
		var newValue, oldValue;
		_.forEachRight(scope.$$watchers, function(watcher) {
			try {
				if (watcher) {
					newValue = watcher.watchFn(self);
					oldValue = watcher.last;
					if (!self.$$areEqual(newValue, oldValue, watcher.valueEq)) {
						self.$root.$$lastDirtyWatch = watcher;
						watcher.last = (watcher.valueEq ? _.cloneDeep(newValue) : newValue);
						watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue: oldValue), self);
						dirty = true;
					} else if (self.$root.$$lastDirtyWatch === watcher) {
						return false;
					}
				}
			} catch(e) {
				console.error(e);
			}
		});
		return continueLoop;
	});
	return dirty;
};

Scope.prototype.$$everyScope = function(fn) {
	if (fn(this)) {
		return this.$$children.every(function(child){
			return child.$$everyScope(fn);
		});
	} else {
		return false;
	}
};

/**
 * $digest() processes all of the watchers of the current scope and its children. Because a watcher's listener can change the * model, the $digest() keeps
 * calling the watchers until no more listeners are firing. This function will throw 'Maxinum iteration limit exceeded.'
 * if the number of iterations exceeds 10.
 * @Scope constructor method.
 */
Scope.prototype.$digest = function() {
	var ttl = 10;
	var dirty;
	this.$root.$$lastDirtyWatch = null;
	this.$beginPhase('$digest');
	if (this.$$applyAsyncId) {
		clearTimeout(this.$$applyAsyncId);
		this.$$flushApplyAsync();
	}
	do {
		while(this.$$asyncQueue.length) {
			try {
				var asyncTask = this.$$asyncQueue.shift();
				asyncTask.scope.$eval(asyncTask.expression);
			} catch (e) {
				console.error(e);
			}
		}
		dirty = this.$$digestOnce();
		if ((dirty || this.$$asyncQueue.length) && !(ttl--)) {
			throw 'Maximum iteration limit exceeded';
		}
	} while (dirty || this.$$asyncQueue.length);
	this.$clearPhase();
	while(this.$$postDigestQueue.length) {
		try {
			this.$$postDigestQueue.shift()();
		} catch (e) {
			console.error(e);
		}
	}
};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
	if (valueEq) {
		return _.isEqual(newValue, oldValue);
	} else {
		return newValue === oldValue || (typeof newValue === 'number' && typeof oldValue === 'number' && isNaN(newValue) && isNaN(oldValue));
	}
};

/**
 * $eval() executes the expression on the current scope and returns the result. Any exceptions in the expression are propagated (uncaught).
 * This is useful when evaluating AngularJS expressions.
 * @param {string or function()} expr - expression 
 * @param {object} locals - Local variables object, useful for overriding values in scope.
 * @returns {} - The result of evaluating the expression.
 */
Scope.prototype.$eval = function(expr, locals) {
	return expr(this, locals); 
};

/**
 * $apply() is used to execute an expression in AngularJS from outside of the AngularJS framework. 
 * (e.g from browser DOM events, setTimeout, XHR or third party libraries)
 * @param {string} expr - expression 
 * @param {function(scope)} expr - expression (execute the function with current scope parameter.)
 */
Scope.prototype.$apply = function(expr) {
	try {
		this.$beginPhase('$apply');
		return this.$eval(expr);
	} finally {
		this.$clearPhase();
		this.$root.$digest();
	}
};

/**
 * $evalAsync() executes the expression on the current scope at a later point in time. 
 * $evalAsync makes no guarantees as to when the expression will be executed, only that:
 * - it will execute after the function that scheduled the evaluation (preferably before DOM rendering.)
 * - at least one $digest cycle will be performed after expression execution.
 * @param {string or function()} expr - expression 
 * @param {object} locals - Local variables object, useful for overriding values in scope.
 */
Scope.prototype.$evalAsync = function(expr) {
	var self = this;
	if (!self.$$phase && !self.$$asyncQueue.length) {
		// setTimeout call is to prevent confusion if someone was to call $evalAsync from outside a digest.	
		setTimeout(function() {
			if (self.$$asyncQueue.length) {
				self.$root.$digest();
			}
		}, 0);
	}
	this.$$asyncQueue.push({scope: self, expression: expr});
};

Scope.prototype.$$flushApplyAsync = function() {
	while(this.$$applyAsyncQueue.length) {
		try {
			this.$$applyAsyncQueue.shift()();
		} catch (e) {
			console.error(e);	
		}
	}
	this.$$applyAsyncId = null;
};

/**
 * $applyAsync() schedule the invocation of $apply to occur at a later time. The actual time difference varies across browsers, but is typically
 * around ~10 milliseconds. This can be used to queue up multiple expressions which need to be evaluated in the same digest.
 * @param {string or function()} expr
 */
Scope.prototype.$applyAsync = function(expr) {
	var self = this;
	this.$$applyAsyncQueue.push(function() {
		self.$eval(expr);
	});
	if (self.$$applyAsyncId === null) {
		self.$$applyAsyncId = setTimeout(function() {
			self.$apply(_.bind(self.$$flushApplyAsync, self));
		}, 0);
	}
};

Scope.prototype.$beginPhase = function(phase) {
	if (this.$$phase) {
		throw this.$phase + ' already in progress.';
	}
	this.$$phase = phase;
};

Scope.prototype.$clearPhase = function() {
	this.$$phase = null;
};

Scope.prototype.$$postDigest = function(fn) {
	this.$$postDigestQueue.push(fn); 
};

/**
 * Creates and returns a new child scope.
 * @Scope constructor method
 */
Scope.prototype.$new = function() {
	var ChildScope = function() {
	};
	ChildScope.prototype = this;
	var child = new ChildScope();
	this.$$children.push(child);
	child.$$watchers = [];
	child.$$children = [];
	return child;
};

module.exports = Scope;
