# DSL (domain specific language) for ERic

Here you can find the full specification of our DSL for describing ER diagrams. 

It is quite similar to [DBML](https://dbml.dbdiagram.io/) but describes Entities more generic (not as technical tables).

*This is our first version and constantly under development*

```
Entity Sales as S {
  sold_date date
  product_id int
  amount int
  ...
}

Entity Product as P {
  id int [pk] // primary key
  name string
  "Product Type" string // well-written name
  ...
}

// entity without attributes
Entity Region as R 

...

// relationship on attributes
Ref: Sales.product_id > Product.id
// relationship on entity
Ref: Sales > Region

// alternative using the id's
// Ref: S.product_id > P.id)

```
