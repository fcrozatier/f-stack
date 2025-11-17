# Signals mental model

1. We create a piece of state and map it to the DOM in a setup function which
   runs inside an effect (up arrow)
2. We mutate the state or perform an operation on it (left arrow)
3. The setup function from point 1 runs again, with no clue as to what change
   happened. (down arrow)
4. We need to update the DOM but recreating it wouldn't be optimal so we need to
   resort to diffing, keying or other tricks to make a performant update and
   compensate for the lack of info about what happened (right arrow)

![Signals Mental Model](<assets/signals_mental_model.png>)
