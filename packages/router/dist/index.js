'use strict';

var history = require('history');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/router.tsx
var Router = class {
  constructor(options) {
    this.history = history.createBrowserHistory();
    this.routes = options.routes;
    this.subscribers = /* @__PURE__ */ new Set();
    this.state = {
      location: this.history.location,
      navigation: { state: "idle" },
      loaderData: {},
      actionData: {},
      errors: {}
    };
    this.history.listen(({ location }) => {
      this.navigate(location);
    });
  }
  async navigate(location) {
    this.setState({
      ...this.state,
      navigation: { state: "loading", location }
    });
    const matches = this.matchRoutes(location);
    const loaderData = {};
    const errors = {};
    for (const match of matches) {
      const route = match.route;
      if (route.loader) {
        try {
          loaderData[route.id || route.path] = await route.loader();
        } catch (error) {
          errors[route.id || route.path] = error;
        }
      }
    }
    this.setState({
      location,
      navigation: { state: "idle" },
      loaderData,
      actionData: {},
      errors
    });
  }
  matchRoutes(location) {
    return this.routes.filter((route) => route.path === location.pathname).map((route) => ({ route, params: {} }));
  }
  setState(newState) {
    this.state = newState;
    this.subscribers.forEach((subscriber) => subscriber());
  }
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
  getState() {
    return this.state;
  }
  async submit(url, formData) {
    const matches = this.matchRoutes({
      pathname: url,
      search: "",
      hash: "",
      state: null
    });
    const match = matches[matches.length - 1];
    if (!match?.route.action) {
      throw new Error(`No action found for ${url}`);
    }
    this.setState({
      ...this.state,
      navigation: { state: "submitting", formData }
    });
    try {
      const actionData = await match.route.action(formData);
      this.setState({
        ...this.state,
        actionData: { [match.route.id || match.route.path]: actionData },
        navigation: { state: "idle" }
      });
    } catch (error) {
      this.setState({
        ...this.state,
        errors: { [match.route.id || match.route.path]: error },
        navigation: { state: "idle" }
      });
    }
  }
};
var RouterContext = react.createContext(null);
function RouterProvider({
  router,
  children
}) {
  const [state, setState] = react.useState(router.getState());
  react.useEffect(() => {
    return router.subscribe(() => {
      setState(router.getState());
    });
  }, [router]);
  return /* @__PURE__ */ jsxRuntime.jsx(RouterContext.Provider, { value: router, children: state.navigation.state === "loading" ? /* @__PURE__ */ jsxRuntime.jsx("div", { children: "Loading..." }) : children });
}
function useRouter() {
  const router = react.useContext(RouterContext);
  if (!router) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return router;
}
function useNavigate() {
  const router = useRouter();
  return (to) => {
    router.navigate({ pathname: to, search: "", hash: "", state: null });
  };
}
function useLoaderData(routeId) {
  const router = useRouter();
  const state = router.getState();
  return state.loaderData[routeId];
}
function useActionData(routeId) {
  const router = useRouter();
  const state = router.getState();
  return state.actionData[routeId];
}
function Form({
  action,
  children,
  method = "post"
}) {
  const router = useRouter();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await router.submit(action, formData);
  };
  return /* @__PURE__ */ jsxRuntime.jsx("form", { onSubmit: handleSubmit, method, children });
}
function Link({
  to,
  children,
  ...props
}) {
  const router = useRouter();
  const handleClick = (event) => {
    event.preventDefault();
    router.navigate({ pathname: to, search: "", hash: "", state: null });
  };
  return /* @__PURE__ */ jsxRuntime.jsx("a", { href: to, onClick: handleClick, ...props, children });
}

exports.Form = Form;
exports.Link = Link;
exports.Router = Router;
exports.RouterProvider = RouterProvider;
exports.useActionData = useActionData;
exports.useLoaderData = useLoaderData;
exports.useNavigate = useNavigate;
exports.useRouter = useRouter;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map