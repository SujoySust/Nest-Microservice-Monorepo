export function HideField(target: any, key: string) {
  const hiddenProp = `${key}_hidden`;

  const getter = function () {
    return undefined;
  };

  const setter = function (value: any) {
    Object.defineProperty(this, hiddenProp, {
      value,
      enumerable: false,
      configurable: true,
    });
  };

  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true,
  });
}

export function FieldMiddleware(transformation: (value: any) => any) {
  return function (target: any, key: string) {
    const setter = function (value: any) {
      const newValue = transformation(value);
      Object.defineProperty(this, key, {
        value: newValue,
        enumerable: true,
        configurable: true,
      });
    };

    Object.defineProperty(target, key, {
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}
