Description:
------------

A simple state machine written in CoffeeScript. Forked from https://github.com/stephenb/coffee-machine/

Installation:
-------------

    bower install coffee-machine-bower

Usage:
------

A "CoffeeMachine" class is provided that can be used as the basis of your state machine implementation.
The object passed in to the constructor has an expected format that will define the state machine. 
The sample stuff below will use a chess game as a basic example.

Step one will always be to require the state machine:

```coffee-script
  {CoffeeMachine} = require 'coffee_machine'
```
The CoffeeMachine class' constructor takes in an object that defines the entire state machine.
Here's what it looks like:

 ```coffee-script
states:
  stateName: 
    active:  true/false (optional, the 1st state defaults to true)
    onEnter: enterMethod (called when successfully entering the state)
    onExit:  exitMethod (called when successfully exiting the state)
    guard:   guardMethod (stops the change to this state if returns false)
  stateName2: etc...
events:
  eventName:
    from: fromState (should be a defined state, or "any")
    to:   toState (should be a defined state)
  eventName2: etc...
onStateChange: changeMethod (called on any state change)
```

If you don't need anything fancy on the states, then you can use a basic Array setup:
      
```coffee-script
game = new CoffeeMachine states: ['whiteToMove', 'blackToMove']

game.availableStates() 
# outputs: [ 'whiteToMove', 'blackToMove' ]
game.currentState() 
# outputs: 'whiteToMove'
```

But, you should really define some *events* that will trigger state changes. Each 
defined event gives you a method you can call to trigger the state change.

```coffee-script
class ChessGame extends CoffeeMachine
  switchSides: ->
    # ...
    console.log "switchSides called."

game = new ChessGame 
  states:
    whiteToMove:
      onEnter: -> this.switchSides()
    blackToMove:
      onEnter: -> this.switchSides()
  events:
    whiteMoved: {from:'whiteToMove', to:'blackToMove'}
    blackMoved: {from:'blackToMove', to:'whiteToMove'}

game.whiteMoved()
# outputs: switchSides called.
```
      
You can also pass the states definition to the defineCoffeeMachine method. So, a more custom 
and comprehensive implementation may look like:

```coffee-script
class ChessGame extends CoffeeMachine
constructor: (@board, @pieces) ->
  @defineStateMachine
    states:
      whiteToMove:
        # If black was in check, sides can't switch unless they're now not in check
        guard: (args) -> not (args.from is 'blackInCheck' and this.blackKingInCheck())
        onEnter: -> this.deliverMessage('white', 'Your move.')
      blackToMove:
        guard: (args) -> not (args.from is 'whiteInCheck' and this.whiteKingInCheck())
        onEnter: -> this.deliverMessage('black', 'Your move.')
      whiteInCheck:
        onEnter: -> this.deliverMessage('white', 'Check!')
        onExit: -> this.deliverMessage('white', 'Check escaped.')
      blackInCheck:
        onEnter: -> this.deliverMessage('black', 'Check!')
        onExit: -> this.deliverMessage('black', 'Check escaped.')
      whiteCheckmated:
        onEnter: -> 
          this.deliverMessage('white', 'Checkmate, you lose :-(')
          this.deliverMessage('black', 'Checkmate, you win!')
      blackCheckmated:
        onEnter: -> 
          this.deliverMessage('black', 'Checkmate, you lose :-(')
          this.deliverMessage('white', 'Checkmate, you win!')
    events:
      whiteMoved:      { from: 'whiteToMove',                   to: 'blackToMove' }
      whiteChecked:    { from: ['blackToMove', 'blackInCheck'], to: 'whiteInCheck' }
      whiteCheckMated: { from: ['blackToMove', 'blackInCheck'], to: 'whiteCheckmated' }
      blackMoved:      { from: 'blackToMove',                   to: 'whiteToMove' }
      blackChecked:    { from: ['whiteToMove', 'whiteInCheck'], to: 'blackInCheck' }
      blackCheckMated: { from: ['whitetoMove', 'whiteInCheck'], to: 'blackCheckmated' }
    onStateChange: (args) -> this.logActivity(args.from, args.to, args.event)

blackKingInCheck: ->
  # ...

whiteKingInCheck: ->
  # ...

deliverMessage: (playerColor, message) ->
  console.log "[Message to #{playerColor}] #{message}"

logActivity: (from, to, event) ->
  console.log "Activity: from => #{from}, to => #{to}, event => #{event}"

##################################

game = new ChessGame

game.whiteMoved()
# outputs: 
# [Message to black] Your move.
# Activity: from => whiteToMove, to => blackToMove, event => whiteMoved

game.blackMoved()
# outputs: 
# [Message to white] Your move.
# Activity: from => blackToMove, to => whiteToMove, event => blackMoved

game.blackChecked()
# outputs: 
# [Message to black] Check!
# Activity: from => whiteToMove, to => blackInCheck, event => blackChecked

game.whiteCheckMated()
# outputs:
# [Message to black] Check escaped.
# [Message to white] Checkmate, you lose :-(
# [Message to black] Checkmate, you win!
# Activity: from => blackInCheck, to => whiteCheckmated, event => whiteCheckMated

try
  game.blackMoved()
catch error
  console.log error
# outputs: 
# Cannot change from state 'blackToMove'; it is not the active state!
```      
      
Note that each callback method (onEnter, onExit, guard, and onStateChange) gets passed an args object that 
has a "from", "to", and "event" key, providing the previous state, new state, and the 
event that triggered the state change. 

You can pass additional arguments to each callback method:

```coffee-script
class ChessGame extends CoffeeMachine
  constructor: (@board, @pieces) ->
    @defineStateMachine   
      states:
        whiteToMove:
          guard: (event, moveFrom, moveTo) -> @isValidMove('white', moveFrom, moveTo)
          onEnter: (event, moveFrom, moveTo)-> logMove('white', moveFrom, moveTo)
        blackToMove:                                                                 
          guard: (event, moveFrom, moveTo) -> @isValidMove('white', moveFrom, moveTo)
          onEnter: (event, moveFrom, moveTo)-> logMove('black', moveFrom, moveTo)
      events:
        whiteMoved: {from:'whiteToMove', to:'blackToMove'}
        blackMoved: {from:'blackToMove', to:'whiteToMove'}

  isValidMove: (playerColor, moveFrom, moveTo)->
    # ...
    if invalid
      @deliverMessage(playerColor, "Invalid move. Try again")   
  
  deliverMessage: (playerColor, message) ->
    console.log "[Message to #{playerColor}] #{message}"
    
  logMove: (playerColor, moveFrom, moveTo)->
    console.log "Moved: #{playerColor} from #{moveFrom} to #{moveTo}"

##################################

game = new ChessGame 
    
game.whiteMoved('e4', 'e5')  
# outputs: 
# Moved: white from e4 to e5 
    
# Move King forward two sqares    
game.blackMoved('Ke1', 'Ke3')  
# outputs: 
# [Message to black] Invalid move. Try again
```

Tests
------
```bash
cake test
```
    
