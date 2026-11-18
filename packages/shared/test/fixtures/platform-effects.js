import { appIds, registerAppModules } from "../../src/app/uklad/index.ts";

export function recordPlatformEffects(runtime) {
  const effects = [];
  registerAppModules(runtime, [
    (registrar) => {
      for (const effectId of Object.values(appIds.effects)) {
        registrar.regEffect(effectId, (payload) => {
          effects.push([effectId, payload]);
        });
      }
    },
  ]);
  return effects;
}
