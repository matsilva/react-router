import React, { createContext, useContext, useEffect, useState } from "react";
import { Router } from "./router";
import { RouterState } from "./types";

const RouterContext = createContext<Router | null>(null);

export function RouterProvider({
  router,
  children,
}: {
  router: Router;
  children?: React.ReactNode;
}) {
  const [state, setState] = useState<RouterState>(router.getState());

  useEffect(() => {
    return router.subscribe(() => {
      setState(router.getState());
    });
  }, [router]);

  return (
    <RouterContext.Provider value={router}>
      {state.navigation.state === "loading" ? <div>Loading...</div> : children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return router;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string) => {
    router.navigate({ pathname: to, search: "", hash: "", state: null });
  };
}

export function useLoaderData<T = unknown>(routeId: string): T {
  const router = useRouter();
  const state = router.getState();
  return state.loaderData[routeId] as T;
}

export function useActionData<T = unknown>(routeId: string): T | undefined {
  const router = useRouter();
  const state = router.getState();
  return state.actionData[routeId] as T;
}

export function Form({
  action,
  children,
  method = "post",
}: {
  action: string;
  children: React.ReactNode;
  method?: "post" | "get";
}) {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await router.submit(action, formData);
  };

  return (
    <form onSubmit={handleSubmit} method={method}>
      {children}
    </form>
  );
}

export function Link({
  to,
  children,
  ...props
}: {
  to: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.navigate({ pathname: to, search: "", hash: "", state: null });
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
