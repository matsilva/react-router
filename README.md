# React SPA Router

A modern, client-side focused router for React Single Page Applications.

## Philosophy

This router is built on the belief that Single Page Applications are a valid and powerful architecture choice. While universal JavaScript and server-side rendering have their place, not every application needs that complexity. This router focuses on providing the best possible developer experience for client-side routing in React applications.

## Features

- 🎯 Client-side focused - No server-side rendering complexity
- 🔄 Modern data loading with loaders
- 📝 Form handling with actions
- 🎨 Type-safe routing with TypeScript
- 🪝 Intuitive React hooks API
- 📦 Small bundle size
- 🚀 Zero configuration needed

## Quick Start

```bash
npm install @react-spa-router/core
```

```tsx
import { createRouter, RouterProvider } from '@react-spa-router/core';

const router = createRouter({
  routes: [
    {
      path: '/',
      element: <Home />,
      loader: async () => {
        const data = await fetchData();
        return data;
      },
    },
    {
      path: '/about',
      element: <About />,
    },
  ],
});

function App() {
  return <RouterProvider router={router} />;
}
```

## Documentation

[Coming soon] 