# F-Stack

_Rethinking fullstack development_

Here is my experimental stack. If you like when things fall neatly into place in
a clean, coherent and holistic design then this is for you too.

## Values

1. The focus is on having **clean mental models** for every part of the stack.
   Which gives you a superpower: **understanding**. When you can reason clearly
   about your own application code then you're in a good, future proof, place.
   No magic.
2. I'm not after performance for it's own sake. It's JavaScript man, not Rust.
   As long as performance is good, I prefer clean, readable, maintainable code.
   I don't want to need 10 coffees to understand what I wrote.
3. I'm not chasing DX above all. Oftentimes too much comfort means "magic"
   solutions, where we loose track of what's going on. This quickly becomes
   un-debuggable and impossible to reason about. I don't trade long term
   understanding for immediate comfort.

## Architecture

The current pieces are (more to come):

### [Functorial](./packages/functorial/README.md)

A new `Proxy`-based reactivity system, that goes beyond Signals. More idiomatic.
More granular.

It's a structured way to declaratively interact with web API in a reactive
manner

### [Reflow](./packages/reflow/README.md)

A minimal frontend framework powered by template tags and providing Functorial
mappings to all common web APIs.
