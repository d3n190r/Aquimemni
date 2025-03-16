# Coding Principles

## Liskov Substitution Principle

> “If S is a subtype of T, then objects of type T may be replaced
with objects of type S without altering any of the desirable
properties of the program”

### Practically

_Code that uses pointers to base classes must be able to use
objects of derived classes without knowing it._

## Type Conformity

> “If S is a subtype of T, an object of type S can be provided in any
context where an object of type T is expected while preserving
correctness.”

### Practically

A derived class should respect the base class’ pre/post-conditions
and invariants.

## Principle of Closed Behavior

> ““If S is a subtype of T, the behavior inherited by S from T should
preserve correctness in S.”

### Practically

Inherited functionality should respect the derived class’
pre/post-conditions and invariants.

## Single-responsibility principle

> “Every class must have only one responsibility.”

## open-closed principle

> “Software entities should be open for extension,
but closed for modification”

## Low coupling / high cohesion

> “Coupling is the degree to which the different classes depend on
each other.
→ Should be as low as possible.  
> Cohesion is the degree to which the elements of a class belong
together.
→ Should be as high as possible.”

## other noteworthy design Principles

__[SOLID](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)__

