import { ReactNode } from "react";

export interface RouteObject {
  path: string;
  element?: ReactNode;
  errorElement?: ReactNode;
  loader?: LoaderFunction;
  action?: ActionFunction;
  children?: RouteObject[];
  id?: string;
}

export interface LoaderFunction {
  (): Promise<unknown> | unknown;
}

export interface ActionFunction {
  (formData: FormData): Promise<unknown> | unknown;
}

export interface RouterState {
  location: Location;
  navigation: Navigation;
  loaderData: Record<string, unknown>;
  actionData: Record<string, unknown>;
  errors: Record<string, unknown>;
}

export interface Navigation {
  state: "idle" | "loading" | "submitting";
  location?: Location;
  formData?: FormData;
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
}

export interface RouterOptions {
  routes: RouteObject[];
}
