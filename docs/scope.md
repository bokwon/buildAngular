# Scopes

	1. An object that refers to the application model.
	2. An execution context for expressions.
	3. Hierarchical structure which mimic the DOM structure of the application.
	4. Can watch expressions and propagate events.

## Methods

### $watch()

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

### $digest()

Processes all of the watchers of the current scope and its children. Because a watcher's listener can change the model, the $digest() keeps calling the watchers until no more listeners are firing. This means that it is possible to get into an infinite loop. This function will throw 'Maximum iteration limit exceeded.' if the number of iterations exceeds 10. (TTL: Time To Live. TTL is set to 10)

### $eval()

```
$eval([expression], [locals]);
```

Executes the expression on the current scope and returns the result. Any exceptions in the expression are propagated (uncaught).

**expression**
>An AngularJS expression to be executed. (string or function(scope))
**locals**
>Local variables object, useful for overriding values in scope.
