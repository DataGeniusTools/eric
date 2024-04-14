module.exports = `
Model {
	Statements
	  = Statement*

	Statement
		= EntityDeclaration
		| RefDeclaration

	EntityDeclaration
		= "Entity" ident ("." ident)? ("as" ident)? Attributes*

	Attributes
        = "{" Attribute* "}" 

	Attribute
		= ident (datatype)? ("[pk]")?

	RefDeclaration
		= "Ref" RefElement

	RefElement                             
		= ident "." ident ("." ident)? ">" ident "." ident ("." ident)?
		
	datatype
		= "date"
		| "double"
		| "int"
		| "string"

	ident  (an identifier)
		= letter (alnum | "_")*

	// the two types of comments
	comment = multiLineComment | singleLineComment
	multiLineComment = "/*" (~"*/" any)* "*/"
	singleLineComment = "//" (~lineTerminator any)*

	// the valid line terminators (used by single line comment)
	lineTerminator = "\\n" | "\\r" | "\\u2028" | "\\u2029"

	// add our comments to white spaces known to Ohm
	space += comment
}`