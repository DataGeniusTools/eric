# <img src="src/logo.png" alt="logo" width="32"/> ERic	

ERic is an interactive Entity Relationship (ER) creator tool. You can use it to create your ER diagrams using textual descriptions and let ERic visualize the resulting ER diagram.

![eric.png](eric.png)

This diagram was generated using the definiton below:

```
Entity Customer {
  id int [pk]
  fname string
  lname string
}

Entity Order {
  id int [pk]
  customerId int
  orderDate date
}

Entity OrderLine {
  position int [pk]
  quantiy int
  articleId int
}

Entity Address {
  int id [pk]
  zip string
  street string
  city string  
}

Ref Customer > Order

Ref OrderLine > Order

Ref Customer > Address
```

## Grammar

Use ERic's domain specific language to create your own entity relationship diagrams.

An entity is marked with the key word Entity followed by a name and an optional alias:

```
Entity Person As P
```

This is the simplest form of an entity. Entities are displayed as nodes in the ERic graph. You can fine tune the definition and add attributes as well

```
Entity Person As P {
  id
  fname
  lname
}
```

Finally you can add data types and mark primary keys with a "[pk]" to the attributes.

```
Entity Person As P {
  id int [pk]
  fname string
  lname string
}
```

ERic supports the following data types

- date
- double
- int
- string

With keyword Ref you can model "one to many" relations between two entities like

```
Ref Customer > Order
```

This will create the "one to many" connection in the ERic graph.

The full grammar of ERic's domain specific language can be found in ![here](src/Ohm.js).
