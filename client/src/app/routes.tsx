import { Navigate, type RouteObject } from "react-router";
import { Loading } from "../components/ui/Spinner.tsx";
import { RequireAuth } from "../features/auth/components/RequireAuth.tsx";
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
          {
            path: "connexion",
            lazy: async () => ({
              Component: (await import("../pages/LoginPage.tsx")).LoginPage,
            }),
          },
          {
            path: "inscription",
            lazy: async () => ({
              Component: (await import("../pages/RegisterPage.tsx"))
                .RegisterPage,
            }),
          },
          {
            // Pages reserved to signed-in customers
            element: <RequireAuth />,
            children: [
              {
                path: "compte",
                lazy: async () => ({
                  Component: (await import("../pages/AccountPage.tsx"))
                    .AccountPage,
                }),
              },
            ],
          },
          // Former URLs, kept working for old links
          { path: "accueil", element: <Navigate to="/heros" replace /> },
          { path: "userpage", element: <Navigate to="/compte" replace /> },
          { path: "pagehero/:id", element: <LegacyHeroRedirect /> },
          { path: "*", Component: NotFoundPage },
        ],
      },
    ],
  },
];
