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
	
### $digest()

Processes all of the watchers of the current scope and its children. Because a watcher's listener can change the model, the $digest() keeps calling the watchers until no more listeners are firing. This means that it is possible to get into an infinite loop. This function will throw 'Maximum iteration limit exceeded.' if the number of iterations exceeds 10. (TTL: Time To Live. TTL is set to 10)

