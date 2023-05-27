import {container} from "../../config/container";
import {injectable} from "inversify";

export function autoBindSingleton() {
  return function(target: Function) {
    container.bind<typeof target>(target)
      .to(target as new (...args: never[]) => Function)
      .inSingletonScope()
      .whenTargetIsDefault();
    injectable()(target as new (...args: never[]) => Function);
  }
}
