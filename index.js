function FancyMap() {
  const __map = new Map();
  /** @type {Map} */
  const __current = null;

  const __stack = [];

  const __ERROR_SYM = new Symbol('FancyMap error');

  /**
   * @this FancyMap
   */
  this.bind = function(f, context) {
    // Ensure context
    if (!context) {
      if (!__current) {
        context = this.createContext();
      } else {
        context = __current;
      }
    }

    return () => {
      this.enter(context);

      try {
        return f.apply(this, arguments);
      } catch (err) {
        err[__ERROR_SYM] = context;
        throw err;
      } finally {
        this.exit(context);
      }
    };
  };

  /**
   * @this FancyMap
   */
  this.createContext = function() {
    return Object.create(__current);
  };

  /**
   * @this FancyMap
   */
  this.enter = function(context) {
    __stack.push(context);
    __current = context;
  };

  /**
   * Eject from the FancyMap
   */
  this.exit = function(context) {
    if (__current === context) {
      __current = __stack.pop();
      return;
    }
    const index = __stack.lastIndexOf(context);
    // error if context isn't at top of stack
    // error if !index?

    __stack.splice(index, 1);
  };

  /**
   * @this FancyMap
   */
  this.get = function(key) {
    return __current.get(key);
  };

  /**
   * @this FancyMap
   */
  this.run = function(f) {
    const context = this.createContext();
    this.enter(context);

    try {
      f(context);
      return context;
    } catch (err) {
      err[__ERROR_SYM] = context;
      throw err;
    } finally {
      this.exit(context);
    }
  };

  /**
   * @this FancyMap
   */
  this.runAndReturn = function(f) {
    let value;

    this.run(function(context) {
      value = f(context);
    });

    return value;
  };

  /**
   * @this FancyMap
   */
  this.set = function(key, value) {
    __current.set(key, value);
    return value;
  };
}

module.exports = FancyMap;
