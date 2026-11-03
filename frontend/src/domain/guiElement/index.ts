/** guiElement の窓口。キャンバスに配置する要素に関するもの */
export type { GuiElement } from "./entities/GuiElement"
export { containsPoint, findElementAt } from "./services/hitTest"
export { parseSvg } from "./services/svgParser"
export type { ParsedSvg, SvgParseResult } from "./services/svgParser"
export { sanitizeSvg } from "./services/svgSanitizer"
