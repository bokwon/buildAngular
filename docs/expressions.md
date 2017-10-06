# Expressions

	1. Lexer: It takes the original expression string and returns an array of tokens parsed from that string.
	2. AST Builder: It takes the array of tokens generated fy the lexer, and builds up and Abstract Syntax Tree (AST) from them. The tree represents the syntactic structure of the expression as nested JavaScript objects.
	``` javascript
		{
			type: AST.BinaryExpression,
			operator: '+',
			left: {
				type: AST.Identifier,
				name: 'a'
			},
			right: {
				type: AST.Identifier,
				name: 'b'
			}
		}
	```
	3. AST Compiler: It takes the abstract syntax tree and compiles it into a JavaScript function that evaluates the expression represented in the tree.
	``` javascript
		function(scope) {
			return scope.a + scope.b;
		}
	```
	4. Parser : It is reponsible for combining the low-level steps mentioned above.
