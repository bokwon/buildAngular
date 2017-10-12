# Scopes

	1. An object that refers to the application model.
	2. An execution context for expressions.
	3. Hierarchical structure which mimic the DOM structure of the application.
	4. Can watch expressions and propagate events.

## Methods

### $watch(watchExpression, listener, [objectEquality])

```
$watch(watchExpression, listener, [objectEquality]);
```

Registers a listener callback to be executed whenever the watchExpression changes.

**watchExpression**
>Expression that is evaluated on each $digest cycle. A change in the return value triggers a call to the listener.
* string: Evaluated as expression
* function(scope): called with current scope as a parameter.

**listener**
>Callback called whenevern the value of watchExpression changes.
* function(newValue, oldValue, scope)

**objectEquality(optional)**
>Compare for object equality using angular.equals instead of comparing for reference equality. (default: false)

### $watchGroup(watchExpressions, listener)

A variant of $watch() where it watches an array of watchExpressions. If any one expression in the collection changes the listener is executed. The items in the watchExpressions array are observed via the standard $watch operation. Their return values are examined for changes on every call to $digest. The listener is called whenever any expression in the watchExpressions array changes.

### $digest()

Processes all of the watchers of the current scope and its children. Because a watcher's listener can change the model, the $digest() keeps calling the watchers until no more listeners are firing. This means that it is possible to get into an infinite loop. This function will throw 'Maximum iteration limit exceeded.' if the number of iterations exceeds 10. (TTL: Time To Live. TTL is set to 10)

### $eval([expression], [locals])

```
$eval([expression], [locals]);
```

Executes the expression on the current scope and returns the result. Any exceptions in the expression are propagated (uncaught).

**expression**
>An AngularJS expression to be executed. (string or function(scope))
**locals**
>Local variables object, useful for overriding values in scope.

### $apply([exp])

$apply() is used to execute an expression in AngularJS from outside of the AngularJS framework. (e.g from browser DOM events, setTimeout, XHR or third party libraries)
The big idea of $apply is that we can execute some code that isn't aware of Angular. This enables to integrate code to the 'Angular lifecycle' using $apply.

### $evalAsync([expression], [locals])

Execute the expression on the current scope at a later point in time. It will execute after the function that scheduled the evaluation (preferably before DOM rendering), At least one $digest cycle will be performed after expression execution.

### $applyAsync([exp])

Schedule the invocation of $apply to occur at a later time. The actual time difference varies across browsers, but is typically around ~10 milliseconds. This can be used to queue up multiple expressions which need to be evaluated in the same digest.

### $$postDigest

$$postDigest schedules a function to run "later". Specifically, the function will be run after the next digest has finished. Unlike $evalAsync or $applyAsync, scheduling a $$postDigest function does not cause a digest to be scheduled, so the function execution is delayed until the digest happens for some other reason.

### $watch() vs $watchCollection()

$watch will be triggered by:
``` javascript
  $scope.myArray = [];
  $scope.myArray = null;
  $scope.myArray = someOtherArray;
```

$watchCollection will be triggered by everything above AND:
``` javascript
  $scope.myArray.push({});
  $scope.myArray.splice(0, 1);
  $scope.myArray[0] = {};
```

$watch(..., true) will be triggered by Everything above AND:
``` javascript
  $scope.myArray[0].someProperty = "someValue";
```

### $new(isolate, parent);

```javascript
	$new(isolate, parent);
	//Create a new child scope. Returns the newly created child scope.
```

### $on(name, listener);

Listens on events of a given type. 
Returns a deregistration function for this listener.

``` javascript
  $on(name, function(event, ...args));
  
  //event object 
  {
    targetScope:{Scope}:the scope on which the event was $emit-ed or $broadcast-ed.
    currentScope: {Scope}: the scope that is currently handling the event. Once the event propagates through the scope hierarchy, this property is set to null.
    name:{string}: name of the event.
    stopPropagation:{function=}
    preventDefault:{function}
    defaultPrevented:{boolean} 
  }
```

### $broadcast(name, args);

Dispatches an event name downwards to all child scopes (and their children) notifying the registered $rootScope.Scope listeners. The event life cycle starts at the scope on which $broadcast was called. All listeneres listening for name event on this scope get notified. Afterwards, the event propagates to all direct and indirect scopes of the current scope and calls all registered listeners along the way. The event cannot be canceled. 

### $emit(name, args);

Dispatches an event name upwards through the scope hierarchy notifying the registered $rootScope.Scope listeners. All listeners listening for name event on this scope get notified. Afterwards, the event traverses upwards toward the root scope and calls all registered listeners along the way. The event will stop propagating if one of the listeners cancels it.
