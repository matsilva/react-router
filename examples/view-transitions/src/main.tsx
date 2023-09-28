import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import {
  Await,
  createBrowserRouter,
  defer,
  Form,
  json,
  Link,
  NavLink,
  Outlet,
  RouterProvider,
  unstable_useViewTransitionState,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import "./index.css";

const images = [
  "https://remix.run/blog-images/headers/the-future-is-now.jpg",
  "https://remix.run/blog-images/headers/waterfall.jpg",
  "https://remix.run/blog-images/headers/webpack.png",
  "https://remix.run/blog-images/headers/remix-conf.jpg",
];

const router = createBrowserRouter(
  [
    {
      path: "/",
      Component() {
        let navigation = useNavigation();

        return (
          <>
            {navigation.state !== "idle" ? (
              <div className="is-loading">Loading...</div>
            ) : null}
            <Nav />
            <div className="content">
              <Outlet />
            </div>
          </>
        );
      },
      children: [
        {
          index: true,
          Component() {
            React.useEffect(() => {
              document.title = "Home";
            }, []);
            return <h1>Home</h1>;
          },
        },
        {
          path: "loader",
          async loader() {
            await new Promise((r) => setTimeout(r, 1000));
            return json({ message: "LOADER DATA" });
          },
          Component() {
            let data = useLoaderData() as { message: string };
            React.useEffect(() => {
              document.title = "Loader";
            }, []);
            return (
              <>
                <h1>Loader Page</h1>
                <p>Loader Data: {data.message}</p>
              </>
            );
          },
        },
        {
          path: "action",
          async action() {
            await new Promise((r) => setTimeout(r, 1000));
            return json({ message: "ACTION DATA" });
          },
          Component() {
            let data = useActionData() as { message: string };
            React.useEffect(() => {
              document.title = "Action";
            }, []);
            return (
              <>
                <h1>Action Page</h1>
                <p>Action Data: {data.message}</p>
              </>
            );
          },
        },
        {
          path: "defer",
          async loader({ request }) {
            let value = new URL(request.url).searchParams.get("value") || "";
            return defer({
              value,
              critical: "CRITICAL PATH DATA " + value,
              lazy: new Promise((r) =>
                setTimeout(() => r("LAZY DATA " + value), 1000)
              ),
            });
          },
          Component() {
            let data = useLoaderData() as {
              value: string;
              critical: string;
              lazy: Promise<string>;
            };
            React.useEffect(() => {
              document.title = "Defer";
            }, []);
            return (
              <>
                <h1>Defer {data.value}</h1>
                <p>Critical Data: {data.critical}</p>
                <React.Suspense
                  fallback={<p>Suspense boundary in the route...</p>}
                  key={useLocation().key}
                >
                  <Await resolve={data.lazy}>
                    {(value) => <p>Lazy Data: {value}</p>}
                  </Await>
                </React.Suspense>
              </>
            );
          },
        },
        {
          path: "defer-no-boundary",
          async loader({ request }) {
            let value = new URL(request.url).searchParams.get("value") || "";
            return defer({
              value,
              critical: "CRITICAL PATH DATA - NO BOUNDARY " + value,
              lazy: new Promise((r) =>
                setTimeout(() => r("LAZY DATA - NO BOUNDARY " + value), 1000)
              ),
            });
          },
          Component() {
            let data = useLoaderData() as {
              value: string;
              data: string;
              critical: string;
              lazy: Promise<string>;
            };
            React.useEffect(() => {
              document.title = "Defer (No Boundary)";
            }, []);
            return (
              <>
                <h1>Defer No Boundary {data.value}</h1>
                <p>Critical Data: {data.critical}</p>
                <div>
                  <Await resolve={data.lazy}>
                    {(value) => <p>Lazy Data: {value}</p>}
                  </Await>
                </div>
              </>
            );
          },
        },
        {
          path: "images",
          Component() {
            React.useEffect(() => {
              document.title = "Images";
            }, []);
            return (
              <div className="image-list">
                <h1>Image List</h1>
                <div>
                  {images.map((src, idx) => (
                    // Adds 'transitioning' class to the <a> during the transition
                    <NavLink key={src} to={`/images/${idx}`}>
                      <p>Image Number {idx}</p>
                      <img src={src} alt={`Img ${idx}`} />
                    </NavLink>

                    // Render prop approach similar to isActive/isPending
                    // <NavLink
                    //   key={src}
                    //   to={`/images/${idx}`}
                    //   unstable_viewTransition
                    // >
                    //   {({ isTransitioning }) => (
                    //     <div className={isTransitioning ? "transitioning" : ""}>
                    //       <p>Image Number {idx}</p>
                    //       <img src={src} alt={`Img ${idx}`} />
                    //     </div>
                    //   )}
                    // </NavLink>

                    // Manual hook based approach
                    // <NavImage key={src} src={src} idx={idx} />
                  ))}
                </div>
              </div>
            );
          },
        },
        {
          path: "images/:id",
          Component() {
            let params = useParams();
            // Conditionally apply the transition styles only when navigating _to_
            // this route.  If we apply them statically, clicking back to the home
            // page from this view leaves the image stuck during the animation
            // since it has no corresponding element to shrink into
            let vt = unstable_useViewTransitionState(".");
            React.useEffect(() => {
              document.title = "Image " + params.id;
            }, [params.id]);
            return (
              <div className={`image-detail ${vt ? "transitioning" : ""}`}>
                <h1>Image Number {params.id}</h1>
                <img src={images[Number(params.id)]} alt={`${params.id}`} />
              </div>
            );
          },
        },
      ],
    },
  ],
  {
    future: {
      // Prevent react router from await-ing defer() promises for revalidating
      // loaders, which includes changing search params on the active route
      unstable_fallbackOnDeferRevalidation: true,
    },
  }
);

function NavImage({ src, idx }: { src: string; idx: number }) {
  let href = `/images/${idx}`;
  let vt = unstable_useViewTransitionState(href);
  return (
    <>
      <Link to={href} unstable_viewTransition>
        <p style={{ viewTransitionName: vt ? "image-title" : "" }}>
          Image Number {idx}
        </p>
        <img
          src={src}
          alt={`Img ${idx}`}
          style={{ viewTransitionName: vt ? "image-expand" : "" }}
        />
      </Link>
    </>
  );
}

const rootElement = document.getElementById("root") as HTMLElement;
ReactDOMClient.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider
      router={router}
      future={{
        // Wrap all state updates in React.startTransition()
        v7_startTransition: true,
      }}
    />
  </React.StrictMode>
);

function Nav() {
  let navigate = useNavigate();
  let submit = useSubmit();
  let value = Math.round(Math.random() * 100);
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
          <ul>
            <li>
              The / route has no loader is should be an immediate/synchronous
              transition
            </li>
          </ul>
        </li>
        <li>
          <Link to="/loader" unstable_viewTransition>
            Loader with delay
          </Link>{" "}
          <button
            style={{ display: "inline-block" }}
            onClick={() =>
              navigate("/loader", { unstable_viewTransition: true })
            }
          >
            via useNavigate
          </button>
          <ul>
            <li>
              The /loader route has a 1 second loader delay, and updates the DOM
              synchronously upon completion
            </li>
          </ul>
        </li>
        <li>
          <Form
            method="post"
            action="/action"
            style={{ display: "inline-block" }}
          >
            <button type="submit" style={{ display: "inline-block" }}>
              Action with delay
            </button>
          </Form>{" "}
          <button
            style={{ display: "inline-block" }}
            onClick={() =>
              submit(
                {},
                {
                  method: "post",
                  action: "/action",
                  unstable_viewTransition: true,
                }
              )
            }
          >
            via useSubmit
          </button>
          <ul>
            <li>
              The /action route has a 1 second action delay, and updates the DOM
              synchronously upon completion
            </li>
          </ul>
        </li>
        <li>
          <Link to="/images">Image Gallery Example</Link>
        </li>
        <li>
          <Link to={`/defer?value=${value}`} unstable_viewTransition>
            Deferred Data
          </Link>
          <ul>
            <li>
              The /defer route has 1s defer call that suspends and has it's own
              Suspense boundary
            </li>
          </ul>
        </li>
        <li>
          <Link to="/defer-no-boundary" unstable_viewTransition>
            Deferred Data (without boundary)
          </Link>
          <ul>
            <li>
              The /defer-no-boundary route has a 1s defer that suspends without
              a Suspense boundary in the destination route. This relies on
              React.startTransition to "freeze" the current UI until the
              deferred data resolves
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}
