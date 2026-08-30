import { useEffect, useState } from "react";
import App from "./App";

function resultToState(result) {
  return result.ok
    ? { status: "ready" }
    : { status: "failed", error: result.error };
}

/** Keep the interactive app behind the persistence hydration barrier. */
export function HydrationGate({ app }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    const handleResult = (result) => {
      if (mounted) setState(resultToState(result));
    };
    const handleUnexpectedFailure = (error) => {
      handleResult({ ok: false, error });
    };

    void app.hydration.then(handleResult, handleUnexpectedFailure);
    return () => {
      mounted = false;
    };
  }, [app]);

  const retry = () => {
    setState({ status: "loading" });
    void app.retryHydration().then(
      (result) => setState(resultToState(result)),
      (error) => setState({ status: "failed", error }),
    );
  };

  if (state.status === "loading") {
    return (
      <main className="hydration-gate" role="status" aria-live="polite">
        Loading saved data…
      </main>
    );
  }

  if (state.status === "failed") {
    return (
      <main className="hydration-gate" role="alert">
        <p>
          We couldn’t restore your saved data. It has not been deleted. Please
          try again.
        </p>
        <button type="button" onClick={retry}>
          Retry
        </button>
      </main>
    );
  }

  return <App />;
}
