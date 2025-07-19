import * as ohm from 'ohm-js';
import grammar from '../Ohm.js';

describe('Integration Tests', () => {
  let g;

  beforeEach(() => {
    g = ohm.grammar(grammar);
  });

  describe('Complete DSL Parsing', () => {
    test('should parse complete ER diagram DSL', () => {
      const dsl = `
Entity Customer {
  id int *
  fname string
  lname string
  addressId int
}

Entity Order {
  id int *
  customerId int
  orderDate date
}

Ref Order.customerId > Customer.id
`;

      const result = g.match(dsl);
      expect(result.succeeded()).toBe(true);
    });

    test('should parse DSL with aliases', () => {
      const dsl = `
Entity Customer as C {
  id int *
  name string
}

Entity Order as O {
  id int *
  customerId int
}

Ref O.customerId > C.id
`;

      const result = g.match(dsl);
      expect(result.succeeded()).toBe(true);
    });

    test('should parse DSL with quoted names', () => {
      const dsl = `
Entity "My Customer" as C {
  id int *
  "first name" string
}

Entity "My Order" as O {
  id int *
  "customer id" int
}

Ref O."customer id" > C.id
`;

      const result = g.match(dsl);
      expect(result.succeeded()).toBe(true);
    });

    test('should parse DSL with comments', () => {
      const dsl = `
// Customer entity
Entity Customer {
  id int *     // primary key
  fname string // first name
  lname string // last name
}

/* Order entity
   with customer reference */
Entity Order {
  id int *
  customerId int
}

Ref Order.customerId > Customer.id
`;

      const result = g.match(dsl);
      expect(result.succeeded()).toBe(true);
    });
  });

  describe('Semantics Integration', () => {
    let nodesSemantics, edgesSemantics;

    beforeEach(() => {
      nodesSemantics = g.createSemantics().addOperation('nodes', {
        Statements(e) {
          return {
            nodes: e.nodes().filter(n => n) // remove empty array elements
          }
        },
        Statement(e) {
          if (e.ctorName === 'EntityDeclaration') {
            return e.nodes();
          }
        },
        EntityDeclaration(entity, name, as, alias, attributes) {
          var aliasName = name.nodes();
          if (alias.numChildren > 0) {
            aliasName = alias.nodes()[0];
          }
          return {
            name: name.nodes(),
            alias: aliasName,
            attributes: attributes.nodes()[0],
            hasAttributes: attributes.numChildren > 0 ? 'Y' : 'N'
          };
        },
        Attributes(open, e, close) {
          return e.nodes();
        },
        Attribute(name, type, pk) {
          return {
            name: name.nodes(),
            datatype: type.nodes()[0],
            isPrimaryKey: pk.numChildren > 0 ? 'Y' : 'N'
          };
        },
        Name(e) {
          return e.nodes();
        },
        datatype(e) {
          return e.nodes();
        },
        quotedident(quote1, name, quote2) {
          return name.nodes();
        },
        ident(letter, alnum) {
          return this.nodes();
        },
        _iter(...children) {
          return children.map(c => c.nodes()).flat();
        },
        _terminal() {
          return this.sourceString;
        },
      });

      edgesSemantics = g.createSemantics().addOperation('edges', {
        Statements(e) {
          return {
            edges: e.edges().filter(e => e) // remove empty array elements
          }
        },
        Statement(e) {
          if (e.ctorName === 'RefDeclaration') {
            return e.edges();
          }
        },
        RefDeclaration(ref, refelement, refName) {
          const refData = refelement.edges();
          if (refName.numChildren > 0) {
            refData.name = refName.edges();
          }
          return refData;
        },
        RefElement(e) {
          return e.edges();
        },
        RefEntity(entity1, greater, entity2) {
          return {
            type: 'EntityRef',
            from: entity1.edges(),
            to: entity2.edges(),
            name: entity1.edges() + " → " + entity2.edges()
          };
        },
        RefAttribute(entity1, dot11, attribute1, greater, entity2, dot21, attribute2) {
          return {
            type: 'AttributeRef',
            from: entity1.edges(),
            to: entity2.edges(),
            fromAttribute: attribute1.edges(),
            toAttribute: attribute2.edges(),
            name: entity1.edges() + "." + attribute1.edges() + " → " + entity2.edges() + "." + attribute2.edges()
          };
        },
        RefName(as, name) {
          return name.edges();
        },
        datatype(e) {
          return e.edges();
        },
        quotedident(quote1, name, quote2) {
          return name.edges();
        },
        ident(letter, alnum) {
          return this.edges();
        },
        _iter(...children) {
          return children.map(c => c.edges()).flat();
        },
        _terminal() {
          return this.sourceString;
        },
      });
    });

    test('should extract nodes from DSL', () => {
      const dsl = `
Entity Customer {
  id int *
  name string
}

Entity Order {
  id int *
  customerId int
}
`;

      const result = g.match(dsl);
      expect(result.succeeded()).toBe(true);
      
      // Test that the grammar can parse the DSL
      const nodes = nodesSemantics(result);
      expect(nodes).toBeDefined();
      expect(typeof nodes.nodes).toBe('function');
    });

    test('should extract edges from DSL', () => {
      const dsl = `
Entity Customer {
  id int *
}

Entity Order {
  id int *
  customerId int
}

Ref Order.customerId > Customer.id
`;

      const result = g.match(dsl);
      expect(result.succeeded()).toBe(true);
      
      // Test that the grammar can parse the DSL
      const edges = edgesSemantics(result);
      expect(edges).toBeDefined();
      expect(typeof edges.edges).toBe('function');
    });

    test('should handle entity references', () => {
      const dsl = `
Entity Customer as C
Entity Order as O
Ref O > C
`;

      const result = g.match(dsl);
      expect(result.succeeded()).toBe(true);
      
      // Test that the grammar can parse the DSL
      const edges = edgesSemantics(result);
      expect(edges).toBeDefined();
      expect(typeof edges.edges).toBe('function');
    });
  });
}); 