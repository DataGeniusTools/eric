/* Lexikalische Regeln */
%lex
%%
\s+                   /* Leerzeichen, Tabulatoren, Zeilenumbrüche */
Entity                return 'ENTITY';
Ref                   return 'REF';
int                   return 'INT';
as                    return 'AS';
pk                    return 'PK';
string                return 'STRING';
date                  return 'DATE';
double                return 'DOUBLE';
[a-zA-Z_][a-zA-Z0-9_]*  return 'IDENTIFIER';  /* Attributnamen */
"([^\"\\]|\\.)+"       return 'STRINGVAL';  /* String in doppelten Anführungszeichen */
\{                    return '{';
\}                    return '}';
\[                    return '[';
\]                    return ']';
\>                    return '>';
.                     /* Ignoriere alle anderen Zeichen */

/lex

/* Grammatik Regeln */
%start program

%%

program
  : statements
  ;

statements
  : statements statement
  | statement
  ;

statement
  : entity_declaration
  | ref_declaration
  ;

entity_declaration
  : ENTITY IDENTIFIER opt_as_declaration '{' attributes '}'
  ;

opt_as_declaration
  : /* empty */
  | AS IDENTIFIER
  ;

attributes
  : attributes attribute
  | /* empty */
  ;

attribute
  : IDENTIFIER data_type opt_pk_declaration
  ;

data_type
  : INT
  | STRING
  | DATE
  | DOUBLE
  ;

opt_pk_declaration
  : '[' PK ']'
  | /* empty */
  ;

ref_declaration
  : REF ref_target '>' ref_target
  ;

ref_target
  : IDENTIFIER
  | IDENTIFIER '.' IDENTIFIER
  ;

%%