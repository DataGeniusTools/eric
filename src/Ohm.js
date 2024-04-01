module.exports = `Model {

	Statements
	  = Statement*

	Statement (valid statement starting with Entity or Ref)
		= "Entity" ident ("as" ident)? Attributes*  -- entityDeclaration
		| "Ref" Refelement                          -- refDeclaration

	Refelement (valid Ref element with "entity > entity" or "entity.attribute > entity.attribute")
		= ident "." ident ">" ident "." ident       -- rowRef
		| ident ">" ident                           -- tableRef

	Attributes
        = "{" Attribute* "}" 
        
	Attribute
		= ident (datatype)? ("[pk]")?

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