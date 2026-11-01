import { createBrowserRouter } from "react-router"

import { canvasUseCases } from "./application/canvas"
import { guiElementUseCases } from "./application/guiElement"
import { layerTreeUseCases } from "./application/layerTree"
import { ROUTES } from "./routes"
import { HomePage, DesignPage, RequirementsPage } from "./presentation"

// router にはパターン（"/design/:verification_id"）をそのまま登録する
// 各ページが使うユースケースは、ここで組み立てて渡す
export const router = createBrowserRouter([
    { path: ROUTES.home, element: <HomePage /> },
    {
        path: ROUTES.design,
        element: <DesignPage canvasUseCases={canvasUseCases} guiElementUseCases={guiElementUseCases} layerTreeUseCases={layerTreeUseCases} />,
    },
    { path: ROUTES.requirements, element: <RequirementsPage /> },
])
