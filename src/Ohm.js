module.exports = `
Model {
	Statements
	  = Statement*

	Statement
		= EntityDeclaration
		| RefDeclaration

	EntityDeclaration
		= "Entity" Name ("as" ident)? Attributes*

	Attributes
        = "{" Attribute* "}" 

	Attribute
		= Name (datatype)? ("*")?

	RefDeclaration
		= "Ref" RefElement

	RefElement
		= RefEntity
		| RefAttribute

	RefEntity
		= Name ">" Name

	RefAttribute
		= Name ("." Name)? ">" Name ("." Name)?
		
	Name
		= quotedident
		| ident
	  
	datatype
		= "date"
		| "double"
		| "int"
		| "string"

	quotedident
		= "\\"" (~("\\"") any)* "\\""

	ident (an identifier)
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