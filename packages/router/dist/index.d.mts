import React, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface RouteObject {
    path: string;
    element?: ReactNode;
    errorElement?: ReactNode;
    loader?: LoaderFunction;
    action?: ActionFunction;
    children?: RouteObject[];
    id?: string;
}
interface LoaderFunction {
    (): Promise<unknown> | unknown;
}
interface ActionFunction {
    (formData: FormData): Promise<unknown> | unknown;
}
interface RouterState {
    location: Location;
    navigation: Navigation;
    loaderData: Record<string, unknown>;
    actionData: Record<string, unknown>;
    errors: Record<string, unknown>;
}
interface Navigation {
    state: "idle" | "loading" | "submitting";
    location?: Location;
    formData?: FormData;
}
interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
}
interface RouterOptions {
    routes: RouteObject[];
}

declare class Router {
    private history;
    private routes;
    private state;
    private subscribers;
    constructor(options: RouterOptions);
    navigate(location: Location): Promise<void>;
    private matchRoutes;
    private setState;
    subscribe(callback: () => void): () => void;
    getState(): RouterState;
    submit(url: string, formData: FormData): Promise<void>;
}

declare function RouterProvider({ router, children, }: {
    router: Router;
    children?: React.ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function useRouter(): Router;
declare function useNavigate(): (to: string) => void;
declare function useLoaderData<T = unknown>(routeId: string): T;
declare function useActionData<T = unknown>(routeId: string): T | undefined;
declare function Form({ action, children, method, }: {
    action: string;
    children: React.ReactNode;
    method?: "post" | "get";
}): react_jsx_runtime.JSX.Element;
declare function Link({ to, children, ...props }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
}): react_jsx_runtime.JSX.Element;

export { type ActionFunction, Form, Link, type LoaderFunction, type Location, type Navigation, type RouteObject, Router, type RouterOptions, RouterProvider, type RouterState, useActionData, useLoaderData, useNavigate, useRouter };
