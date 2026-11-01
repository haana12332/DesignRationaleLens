import { createBrowserRouter } from "react-router"

import { ROUTES } from "./routes"
import { HomePage, DesignPage, RequirementsPage } from "./presentation"

// router にはパターン（"/design/:verification_id"）をそのまま登録する
export const router = createBrowserRouter([
    { path: ROUTES.home, element: <HomePage /> },
    { path: ROUTES.design, element: <DesignPage /> },
    { path: ROUTES.requirements, element: <RequirementsPage /> },
])
