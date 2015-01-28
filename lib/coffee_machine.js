(function() {
  var CoffeeMachine, root,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.CoffeeMachine = CoffeeMachine = (function() {
    function CoffeeMachine(stateMachine) {
      this.stateMachine = stateMachine != null ? stateMachine : {
        states: {},
        events: {}
      };
      this.defineStateMachine(this.stateMachine);
    }

    CoffeeMachine.prototype.defineStateMachine = function(stateMachine) {
      var activeStates, event, eventDef, state, stateDef, states, _i, _len, _ref, _ref1, _results,
        _this = this;
      this.stateMachine = stateMachine != null ? stateMachine : {
        states: {},
        events: {}
      };
      if (this.stateMachine.states.constructor.toString().indexOf('Array') !== -1) {
        states = this.stateMachine.states;
        this.stateMachine.states = {};
        for (_i = 0, _len = states.length; _i < _len; _i++) {
          state = states[_i];
          this.stateMachine.states[state] = {
            active: state === states[0]
          };
        }
      }
      activeStates = (function() {
        var _ref, _results;
        _ref = this.stateMachine.states;
        _results = [];
        for (state in _ref) {
          if (!__hasProp.call(_ref, state)) continue;
          stateDef = _ref[state];
          if (stateDef.active) {
            _results.push(state);
          }
        }
        return _results;
      }).call(this);
      if (activeStates.length === 0) {
        _ref = this.stateMachine.states;
        for (state in _ref) {
          if (!__hasProp.call(_ref, state)) continue;
          stateDef = _ref[state];
          stateDef.active = true;
          break;
        }
      } else if (activeStates.length > 1) {
        for (state in activeStates) {
          if (!__hasProp.call(activeStates, state)) continue;
          if (state === activeStates[0]) {
            continue;
          }
          stateDef.active = false;
        }
      }
      _ref1 = this.stateMachine.events;
      _results = [];
      for (event in _ref1) {
        eventDef = _ref1[event];
        _results.push((function(event, eventDef) {
          return _this[event] = function() {
            return this.changeState.apply(this, [eventDef.from, eventDef.to, event].concat(__slice.call(arguments)));
          };
        })(event, eventDef));
      }
      return _results;
    };

    CoffeeMachine.prototype.currentState = function() {
      var state, stateDef;
      return ((function() {
        var _ref, _results;
        _ref = this.stateMachine.states;
        _results = [];
        for (state in _ref) {
          if (!__hasProp.call(_ref, state)) continue;
          stateDef = _ref[state];
          if (stateDef.active) {
            _results.push(state);
          }
        }
        return _results;
      }).call(this))[0];
    };

    CoffeeMachine.prototype.availableStates = function() {
      var state, _ref, _results;
      _ref = this.stateMachine.states;
      _results = [];
      for (state in _ref) {
        if (!__hasProp.call(_ref, state)) continue;
        _results.push(state);
      }
      return _results;
    };

    CoffeeMachine.prototype.availableEvents = function() {
      var event, _ref, _results;
      _ref = this.stateMachine.events;
      _results = [];
      for (event in _ref) {
        if (!__hasProp.call(_ref, event)) continue;
        _results.push(event);
      }
      return _results;
    };

    CoffeeMachine.prototype.changeState = function() {
      var args, data, enterMethod, event, exitMethod, from, fromStateDef, guardMethod, to, toStateDef, transition;
      from = arguments[0], to = arguments[1], event = arguments[2], data = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
      if (event == null) {
        event = null;
      }
      if (from.constructor.toString().indexOf('Array') !== -1) {
        if (from.indexOf(this.currentState()) !== -1) {
          from = this.currentState();
        } else {
          throw "Cannot change from states " + (from.join(' or ')) + "; none are the active state!";
        }
      }
      if (from === 'any') {
        from = this.currentState();
      }
      fromStateDef = this.stateMachine.states[from];
      toStateDef = this.stateMachine.states[to];
      if (toStateDef === void 0) {
        throw "Cannot change to state '" + to + "'; it is undefined!";
      }
      if (fromStateDef === void 0) {
        throw "Cannot change from state '" + from + "'; it is undefined!";
      }
      if (fromStateDef.active !== true) {
        throw "Cannot change from state '" + from + "'; it is not the active state!";
      }
      enterMethod = toStateDef.onEnter, guardMethod = toStateDef.guard;
      exitMethod = fromStateDef.onExit;
      transition = {
        from: from,
        to: to,
        event: event
      };
      args = [transition].concat(__slice.call(data));
      if (guardMethod !== void 0 && guardMethod.apply(this, args) === false) {
        return false;
      }
      if (exitMethod !== void 0) {
        exitMethod.apply(this, args);
      }
      if (enterMethod !== void 0) {
        enterMethod.apply(this, args);
      }
      if (this.stateMachine.onStateChange !== void 0) {
        this.stateMachine.onStateChange.apply(this, args);
      }
      fromStateDef.active = false;
      return toStateDef.active = true;
    };

    return CoffeeMachine;

  })();

}).call(this);
