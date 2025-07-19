import * as ohm from 'ohm-js';
import grammar from '../Ohm.js';

describe('Ohm.js Parser', () => {
  let g;

  beforeEach(() => {
    g = ohm.grammar(grammar);
  });

  describe('Grammar Parsing', () => {
    test('should parse simple entity declaration', () => {
      const result = g.match('Entity Person');
      expect(result.succeeded()).toBe(true);
    });

    test('should parse entity with alias', () => {
      const result = g.match('Entity Person as P');
      expect(result.succeeded()).toBe(true);
    });

    test('should parse entity with attributes', () => {
      const result = g.match(`Entity Person {
  id int *
  name string
}`);
      expect(result.succeeded()).toBe(true);
    });

    test('should parse simple ref declaration', () => {
      const result = g.match('Ref Person > Order');
      expect(result.succeeded()).toBe(true);
    });

    test('should parse ref with attribute', () => {
      const result = g.match('Ref Person.id > Order.personId');
      expect(result.succeeded()).toBe(true);
    });

    test('should parse ref with name', () => {
      const result = g.match('Ref Person > Order as personToOrder');
      expect(result.succeeded()).toBe(true);
    });

    test('should parse quoted identifiers', () => {
      const result = g.match('Entity "My Entity" as ME');
      expect(result.succeeded()).toBe(true);
    });

    test('should parse comments', () => {
      const result = g.match(`// This is a comment
Entity Person // another comment
/* Multi-line
   comment */
Ref Person > Order`);
      expect(result.succeeded()).toBe(true);
    });

    test('should fail with invalid syntax', () => {
      const result = g.match('Invalid Syntax');
      expect(result.succeeded()).toBe(false);
    });
  });

  describe('Semantics - toString', () => {
    let semantics;

    beforeEach(() => {
      semantics = g.createSemantics().addOperation('toString', {
        Statements(e) {
          return e.toString();
        },
        Statement(e) {
          return e.toString();
        },
        EntityDeclaration(entity, name, as, alias, attributes) {
          var name1 = name.toString();
          if (as.numChildren > 0)
            name1 += " as " + alias.toString()[0];
          return "Entity " + name1 + attributes.toString();
        },
        Attributes(open, e, close) {
          return " { " + e.toString() + " }";
        },
        Attribute(name, type, pk) {
          if (pk.numChildren > 0)
            return name.toString() + "🔑 " + type.toString();
          else
            return name.toString() + " " + type.toString();
        },
        RefDeclaration(ref, refelement, refName) {
          if (refName.numChildren > 0)
            return "Ref " + refelement.toString() + " [ " + refName.toString() + " ]";
          else
            return "Ref " + refelement.toString();
        },
        RefElement(e) {
          return e.toString();
        },
        RefEntity(name1, greater, name2) {
          return name1.toString() + " → " + name2.toString();
        },
        RefAttribute(name11, dot11, name12, greater, name21, dot21, name22) {
          return name11.toString() + "." + name12.toString() + " → " + name21.toString() + "." + name22.toString();
        },
        RefName(as, name) {
          return name.sourceString;
        },
        Name(e) {
          return e.sourceString;
        },
        datatype(e) {
          return e.toString();
        },
        quotedident(quote1, name, quote2) {
          return "\"" + name.toString() + "\"";
        },
        ident(letter, alnum) {
          return this.sourceString;
        },
        _iter(...children) {
          return children.map(c => c.toString());
        },
        _terminal() {
          return this.sourceString;
        },
      });
    });

    test('should convert entity to string', () => {
      const result = g.match('Entity Person');
      const output = semantics(result).toString();
      expect(output).toContain('Entity Person');
    });

    test('should convert entity with alias to string', () => {
      const result = g.match('Entity Person as P');
      const output = semantics(result).toString();
      expect(output).toContain('Entity Person as P');
    });

    test('should convert ref to string', () => {
      const result = g.match('Ref Person > Order');
      const output = semantics(result).toString();
      expect(output).toContain('Ref Person → Order');
    });
  });
}); 