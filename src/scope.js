'use strict';
var _ = require('lodash');
function Scope() {
	this.$$watchers = [];
	this.$$lastDirtyWatch = null;
};
function initWatchVal() { };

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq){
	var watcher = {
		watchFn: watchFn,
		listenerFn: listenerFn || function(){ },
		valueEq: valueEq,
		last: !!initWatchVal
	};
	this.$$watchers.push(watcher);
	this.$$lastDirtyWatch = null;
};

Scope.prototype.$$digestOnce = function() {
	var self = this;
	var newValue, oldValue, dirty;
	_.forEach(this.$$watchers, function(watcher) {
		newValue = watcher.watchFn(self);
		oldValue = watcher.last;
		if (newValue !== oldValue) {
			self.$$lastDirtyWatch = watcher;
			watcher.last = newValue;
			watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue: oldValue), self);
			dirty = true;
		} else if (self.$$lastDirtyWatch === watcher) {
			return false;
		}
	});
	return dirty;
};

Scope.prototype.$digest = function() {
	var ttl = 10;
	var dirty
	this.$$lastDirtyWatch = null;
	do {
		dirty = this.$$digestOnce();
		if (dirty && !(ttl--)) {
			throw 'Maximum iteration limit exceeded';
		}
	} while (dirty);
};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
	if (valueEq) {
		return _.isEqual(newValue, oldValue);
	} else {
		return newValue === oldValue;
	}
};

module.exports = Scope;