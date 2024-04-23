// https://ohdarling88.medium.com/4-steps-to-add-custom-language-support-to-monaco-editor-5075eafa156d
// https://microsoft.github.io/monaco-editor/monarch.html
// https://www.npmjs.com/package/@monaco-editor/react

// Define comments pattern
export const comment = /^\s*#([ =|].*)?$/

// Define editor options
export const editorOptions = {
	wordWrap: 'on',
	tabSize: 2,
	minimap: { enabled: false },
	scrollBeyondLastLine: false,
};

export const editorKeywords = [ 'Entity', 'Ref', 'int', 'string', 'date', 'double' ];

// This config defines how the language is displayed in the editor.
export const languageDef = {
	//defaultToken: "",
	//number: /\d+(\.\d+)?/,
	editorKeywords,
	tokenizer: {
		root: [
			[ /@?[a-zA-Z][\w$]*/, {
				cases: {
					'@editorKeywords': 'keyword',
					'@default': 'variable',
				}	
			}],
			[/".*?"/, 'string'],
			[/\/\//, 'comment'],
		],
		/*
	  root: [
		{ include: "@whitespace" },
		{ include: "@numbers" },
		{ include: "@strings" },
		{ include: "@tags" },
		[/^@\w+/, { cases: { "@keywords": "keyword" } }],
	  ],
	  whitespace: [
		[comment, "comment"],
		[/\s+/, "white"],
	  ],
	  numbers: [
		[/@number/, "number"],
	  ],
	  strings: [
		[/[=|][ @number]*$/, "string.escape"],
		// TODO: implement invalid strings
	  ],
	  */
	  //tags: [
		//[/^%[a-zA-Z]\w*/, "tag"],
		//[/#[a-zA-Z]\w*/, "tag"],
	  //],
	},
  }
  
  // This config defines the editor's behavior.
  export const configuration = {
	comments: {
	  lineComment: "//",
	},
	brackets: [
	  ["{", "}"], ["[", "]"], ["(", ")"],
	],
  }