# F-Stack

Welcome to this repo where we explore new wild ideas _rethinking fullstack web
development_

## Why?

We love the web. But the consensus is growing that the tech we use has gone too
far, with too many abstractions and layers, that make it impossible for a single
person to have a comprehensive vision and understanding of his own stack. Even
the application code we write can easily become hard to debug and reason about
in this context.

In parallel, the Platform is maturing more and more, and things that were
previously impossible without compilers, bundlers, transpilers and complex
build-chains can now be done natively, sometimes even without JS. This evolution
empowers us developers to simplify our stack drastically...

## Principles

The guiding principles of this new stack are the following:

1. **Standards First** We use platform APIs: this means less library code, less
   maintenance, and more experience with APIs that are here to stay.
2. **Type Safety** We want type-safe applications, and we develop the stack with
   types in mind.
3. **Minimalism and Clarity** Fewer abstractions, and just the right ones. The
   focus is on having **clear mental models** allowing a single person to
   understand the whole stack with a coherent vision. No magic.

## Architecture

The current pieces are (more to come):

### [Type-strip](https://github.com/fcrozatier/type-strip)

A simple and fast type stripper.

### [Functorial](./packages/functorial/README.md)

A new `Proxy`-based reactivity system, that goes beyond Signals. It's more
idiomatic, more granular, more declarative and doesn't require diffing.

### [Reflow](./packages/reflow/README.md)

A minimal frontend framework powered by template tags and providing Functorial
mappings to all common web APIs.

## Can I contribute?

Sure! Feel free to experiment with the code, open issues, start the
conversation. We won't bite, promise!
