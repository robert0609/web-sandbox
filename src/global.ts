
class Global {
  private _debugMode: boolean;

  constructor() {
    this._debugMode = false;
  }

  get debug() {
    return this._debugMode;
  }

  set debug(v: boolean) {
    this._debugMode = v;
  }
}

export default new Global();
