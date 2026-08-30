export const Appearance = {
  getColorScheme: () => "light",
  addChangeListener: (
    _listener: (event: { colorScheme: "light" | "dark" | null }) => void,
  ) => ({
    remove: () => undefined,
  }),
};

export const Alert = {
  alert: () => undefined,
};

type AppStateListener = (state: "active" | "inactive" | "background") => void;
const appStateListeners = new Set<AppStateListener>();

export const AppState = {
  addEventListener: (_event: "change", listener: AppStateListener) => {
    appStateListeners.add(listener);
    return {
      remove: () => appStateListeners.delete(listener),
    };
  },
  emitChange: (state: "active" | "inactive" | "background") => {
    for (const listener of appStateListeners) listener(state);
  },
};
