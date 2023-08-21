class Container {
  constructor() {
    this.services = {};
  }

  service(name, cb) {
    Object.defineProperty(this, name, {
      get: () => {
        if (!this.services.hasOwnProperty(name)) {
          this.services[name] = cb(this);
        }

        return this.services[name];
      },
      configurable: true,
      enumerable: true
    });

    return this;
  }
}

module.exports = Container;
