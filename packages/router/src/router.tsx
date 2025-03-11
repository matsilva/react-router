import {
  createBrowserHistory,
  History,
  Location as HistoryLocation,
} from "history";
import { RouterOptions, RouterState, RouteObject, Location } from "./types";

export class Router {
  private history: History;
  private routes: RouteObject[];
  private state: RouterState;
  private subscribers: Set<() => void>;

  constructor(options: RouterOptions) {
    this.history = createBrowserHistory();
    this.routes = options.routes;
    this.subscribers = new Set();

    this.state = {
      location: this.history.location,
      navigation: { state: "idle" },
      loaderData: {},
      actionData: {},
      errors: {},
    };

    this.history.listen(({ location }: { location: HistoryLocation }) => {
      this.navigate(location);
    });
  }

  public async navigate(location: Location) {
    this.setState({
      ...this.state,
      navigation: { state: "loading", location },
    });

    const matches = this.matchRoutes(location);
    const loaderData: Record<string, unknown> = {};
    const errors: Record<string, unknown> = {};

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
      errors,
    });
  }

  private matchRoutes(
    location: Location,
  ): { route: RouteObject; params: Record<string, string> }[] {
    // Simple path matching implementation
    // TODO: Implement full path matching with params
    return this.routes
      .filter((route) => route.path === location.pathname)
      .map((route) => ({ route, params: {} }));
  }

  private setState(newState: RouterState) {
    this.state = newState;
    this.subscribers.forEach((subscriber) => subscriber());
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getState() {
    return this.state;
  }

  async submit(url: string, formData: FormData) {
    const matches = this.matchRoutes({
      pathname: url,
      search: "",
      hash: "",
      state: null,
    });
    const match = matches[matches.length - 1];

    if (!match?.route.action) {
      throw new Error(`No action found for ${url}`);
    }

    this.setState({
      ...this.state,
      navigation: { state: "submitting", formData },
    });

    try {
      const actionData = await match.route.action(formData);
      this.setState({
        ...this.state,
        actionData: { [match.route.id || match.route.path]: actionData },
        navigation: { state: "idle" },
      });
    } catch (error) {
      this.setState({
        ...this.state,
        errors: { [match.route.id || match.route.path]: error },
        navigation: { state: "idle" },
      });
    }
  }
}
