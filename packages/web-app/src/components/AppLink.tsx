import type { AnchorHTMLAttributes } from "react";
import {
  appIds,
  useRuntime,
  useSubscription,
  type NavigationRoute,
} from "@ebtest/shared/uklad";
import { appHref } from "../routes";

interface AppLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  route: NavigationRoute;
}

/** Real links retain open-in-new-tab/copy-link behavior and navigate in place. */
export function AppLink({ route, onClick, ...props }: AppLinkProps) {
  const runtime = useRuntime();
  const language = useSubscription(
    [appIds.subscriptions.preferencesSelectedLanguage],
    "AppLink",
  );
  const destination = { language, ...route };
  return (
    <a
      {...props}
      href={appHref(destination)}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (props.target && props.target !== "_self") ||
          props.download !== undefined
        )
          return;
        event.preventDefault();
        runtime.dispatch([
          appIds.events.navigationRouteOpened,
          destination,
          false,
        ]);
      }}
    />
  );
}
