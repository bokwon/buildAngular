'use strict';
function parse(expr) {
	var lexer = new Lexer();
	var parser = new Parser(lexer);
	return parser.parse(expr);
}

function Lexer() {	
}

Lexer.prototype.lex = function(text) {
	// Tokenization will be done here.
	// Token is an object that gives the AST Builder all the information it needs to construct an abstract syntax tree.
	this.text = text; // the original string
	this.index = 0;   // our current character index in the string
	this.ch = undefined; // the curent character
	this.tokens = [];
	while(this.index < this.text.length) {
		this.ch = this.text.charAt(this.index);
		if (this.isNumber(this.ch)) {
			this.readNumber();
		} else {
			throw 'Unexpected next character: ' + this.ch;
		}
	}
	return this.tokens;
};

Lexer.prototype.isNumber = function(ch) {
	return '0' <= ch && ch <= '9';
};

Lexer.prototype.readNumber = function() {
	var number = '';
	while(this.index < this.text.length) {
		var ch = this.text.charAt(this.index);
		if (this.isNumber(ch)) {
			number += ch;
		} else {
			break;
		}
		this.index++;
	}
	this.tokens.push({
		text: number,
		value: Number(number)
	});
};

//Abstract Syntax Tree (AST) builder
function AST(lexer) {
	this.lexer = lexer;
}
AST.Program = 'Program';
AST.Literal = 'Literal';

AST.prototype.ast = function(text) {
	this.tokens = this.lexer.lex(text);
	return this.program();
	// AST building will be done here.
};

AST.prototype.program = function() {
	return {type: AST.Program, body: this.constant()};
};

AST.prototype.constant = function() {
	return {type: AST.Literal, value: this.tokens[0].value};
}

function ASTCompiler(astBuilder) {
	this.astBuilder = astBuilder;
}

ASTCompiler.prototype.compile = function(text) {
	var ast = this.astBuilder.ast(text);
	//AST compilation will be done here.
	this.state = {body: []};
	this.recurse(ast);
	
	return new Function(this.state.body.join(''));
};

ASTCompiler.prototype.recurse = function(ast) {
	switch(ast.type) {
		case AST.Program:
			this.state.body.push('return ', this.recurse(ast.body), ';');
			break;
		case AST.Literal:
			return ast.value;
	}
};

function Parser(lexer) {
	this.lexer = lexer;
	this.ast = new AST(this.lexer);
	this.astComiler = new ASTCompiler(this.ast);
}

Parser.prototype.parse = function(text) {
	return this.astComiler.compile(text);
};

module.exports = parse;