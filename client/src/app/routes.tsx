import { Navigate, type RouteObject } from "react-router";
import { Loading } from "../components/ui/Spinner.tsx";
import { LegacyHeroRedirect } from "../pages/LegacyHeroRedirect.tsx";
import { NotFoundPage } from "../pages/NotFoundPage.tsx";
import { RouteErrorPage } from "../pages/RouteErrorPage.tsx";
import { RootLayout } from "./layout/RootLayout.tsx";

// Each page is loaded on demand (one JavaScript chunk per page)
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    HydrateFallback: Loading,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import("../pages/HomePage.tsx")).HomePage,
            }),
          },
          {
            path: "heros",
            lazy: async () => ({
              Component: (await import("../pages/CatalogPage.tsx")).CatalogPage,
            }),
          },
          {
            path: "heros/:id",
            lazy: async () => ({
              Component: (await import("../pages/HeroPage.tsx")).HeroPage,
            }),
          },
          {
            path: "faq",
            lazy: async () => ({
              Component: (await import("../pages/FaqPage.tsx")).FaqPage,
            }),
          },
          // Former URLs, kept working for old links
          { path: "accueil", element: <Navigate to="/heros" replace /> },
          { path: "pagehero/:id", element: <LegacyHeroRedirect /> },
          { path: "*", Component: NotFoundPage },
        ],
      },
    ],
  },
];
