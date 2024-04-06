# <img src="../src/logo.png" alt="logo" width="32"/> ERic	

## Tutorial

ERic UI is divided into two controls, a text editor on the left side and the visualized graph on the right.

Use ERic's domain specific language to create your own entity relationship diagram in the text editor. The resulting graph will be shown on the right:

![eric.png](../eric.png)


An entity is marked with the key word Entity followed by a name:

```
Entity Person
```

![Entity](Entity.png)

This is the simplest form of an entity. Entities are displayed as nodes in the ERic graph. You can add an optional alias that can be used to reference the entity:

```
Entity Person as P
```

You can fine tune the definition and add attributes as well:

```
Entity Person {
  id
  fname
  lname
}
```

![Entity Attributes](EntityAttributes.png)

Finally you can add data types to the attributes and mark primary keys with a "[pk]":

```
Entity Person {
  id int [pk]
  fname string
  lname string
}
```

![Entity Complete](EntityComplete.png)

ERic supports the following data types

- date
- double
- int
- string

With keyword Ref you can model "one to many" relations between two entities like

```
Ref A > B
```

This will create the "one to many" connection in the ERic graph.

![Ref](Ref.png)


## Grammar

### Names

For names of entities and attributes you can use lower case or uppercase letter followed by letters, numbers oder underscore '_'.

- Entity Person
- Entity order
- Entity order_line
- Entity abc_2_XYZ

### Refs

You can use the name of an entity or its alias when you create a Ref:

```
Entity Customer as C
Entity Address as A

Ref Customer > Address

or

Ref C > Address

or

Ref C > A
```

There are three forms of Ref definitions available:

- Ref A > B
- Ref A.id > B.idA
- Ref C.(id,name) > D.(idC, nameC)

for these entities:

```
Entity A {
  id int [pk]
  name string
}

Entity B {
  idA int
  value double  
}

Entity C {
  id int [pk]
  name string [pk]
}

Entity D {
  idC int [pk]
  nameC string [pk]
  value double  
}
```

The first form creates a direct relation between two entities A and B.

The second and the third form is more precise in the sense that attributes are used to specify the relation between the two entities. If the linked entity has one primary key only the second syntax is sufficient.

For cases where the entities are linked using more than one attribute the third form must be used.

### Comments

You can use two kind of comments inside you ER definition. Single line comments are started with two slashes '//'. The remaining characters in a line are ignored by ERic's parsers.

```
// the person
Entity Person {
  id int [pk]     // the person id
  fname string    // the person first name
  lname string    // the person last name
}
```

Multi line comments are opened with '/*' and closed by '*/'

```
/*****************
 * the person
*****************/
Entity Person {
  id int [pk]     // the person id
  fname string    // the person first name
  lname string    // the person last name
}
```

The full grammar of ERic's domain specific language can be found in [here](../src/Ohm.js).
