import { useEffect, useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

import type { Offset, Point, Viewport } from "@/domain/canvas"
import { screenToWorld, worldToScreen } from "@/domain/canvas"
import type { GuiElement } from "@/domain/guiElement"
import { findElementAt } from "@/domain/guiElement"
import * as styles from "./Canvas.css"

type Props = {
    viewport: Viewport
    elements: readonly GuiElement[]
    selectedId: string | null
    onPan: (offset: Offset) => void
    onZoom: (screenPoint: Point, factor: number) => void
    /** クリックした位置（キャンバス座標）を知らせる */
    onSelectAt: (point: Point) => void
    /** 要素をドラッグで移動したときに、id とワールド座標でのデルタを親に知らせる */
    onMoveElement: (id: string, dx: number, dy: number) => void
}

/** これ以上動いたらクリックではなくドラッグとみなす（px） */
const CLICK_TOLERANCE = 3
const GRID_SIZE = 20

/**
 * ドラッグ状態。
 * - canvas: キャンバス全体のパン
 * - element: 個別の要素を移動
 */
type DragState =
    | { mode: "canvas"; start: Point; last: Point; moved: boolean }
    | { mode: "element"; id: string; start: Point; last: Point; moved: boolean }

/**
 * 無限キャンバス。
 * - 要素の上でドラッグ → 要素を移動
 * - 背景でドラッグ / ホイール → パン、Ctrl+ホイール → ズーム
 * - クリック → 要素を選択（何もない所なら選択解除）
 * 状態は持たず、操作があったら props のコールバックで親に知らせるだけ。
 */
function Canvas({ viewport, elements, selectedId, onPan, onZoom, onSelectAt, onMoveElement }: Props) {
    const rootRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<DragState | null>(null)

    // ホイールのリスナーからも最新のコールバックを使えるようにする
    const latest = useRef({ onPan, onZoom })
    useEffect(() => {
        latest.current = { onPan, onZoom }
    })

    // ブラウザ標準のスクロール・ページ拡大を止めるため、passive: false で直接登録する
    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        function handleWheel(event: WheelEvent) {
            event.preventDefault()
            const rect = root!.getBoundingClientRect()
            const point = { x: event.clientX - rect.left, y: event.clientY - rect.top }
            if (event.ctrlKey || event.metaKey) {
                latest.current.onZoom(point, Math.exp(-event.deltaY * 0.01))
            } else {
                latest.current.onPan({ x: -event.deltaX, y: -event.deltaY })
            }
        }
        root.addEventListener("wheel", handleWheel, { passive: false })
        return () => root.removeEventListener("wheel", handleWheel)
    }, [])

    /** マウス位置をキャンバス左上からのスクリーン座標にする */
    function toScreen(event: { clientX: number; clientY: number }): Point {
        const rect = rootRef.current?.getBoundingClientRect()
        return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) }
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        if (event.button !== 0 && event.button !== 1) return
        event.currentTarget.setPointerCapture(event.pointerId)
        const screen = toScreen(event)

        // 中ボタンは常にキャンバスパン
        if (event.button === 1) {
            dragRef.current = { mode: "canvas", start: screen, last: screen, moved: false }
            return
        }

        // 左ボタン: クリック位置にある要素をヒットテストし、あれば要素ドラッグ
        const world = screenToWorld(screen, viewport)
        const hit = findElementAt(elements, world)

        dragRef.current = hit
            ? { mode: "element", id: hit.id, start: screen, last: screen, moved: false }
            : { mode: "canvas", start: screen, last: screen, moved: false }
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const drag = dragRef.current
        if (!drag) return
        const screen = toScreen(event)
        const distance = Math.hypot(screen.x - drag.start.x, screen.y - drag.start.y)
        if (!drag.moved && distance < CLICK_TOLERANCE) return

        const dx = screen.x - drag.last.x
        const dy = screen.y - drag.last.y

        if (drag.mode === "element") {
            // スクリーン座標のデルタをワールド座標に変換して親に伝える
            onMoveElement(drag.id, dx / viewport.zoom, dy / viewport.zoom)
        } else {
            onPan({ x: dx, y: dy })
        }

        dragRef.current = { ...drag, last: screen, moved: true }
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        const drag = dragRef.current
        dragRef.current = null
        if (drag && !drag.moved && event.type === "pointerup") {
            onSelectAt(screenToWorld(toScreen(event), viewport))
        }
    }

    // 点のグリッド。拡大率に合わせて間隔を変え、細かくなりすぎたら消す
    const gridStep = GRID_SIZE * viewport.zoom
    const background =
        gridStep >= 8
            ? {
                  backgroundImage: `radial-gradient(circle, ${styles.dotColor} 1px, transparent 1px)`,
                  backgroundSize: `${gridStep}px ${gridStep}px`,
                  backgroundPosition: `${viewport.x - gridStep / 2}px ${viewport.y - gridStep / 2}px`,
              }
            : {}

    return (
        <div
            ref={rootRef}
            className={styles.root}
            style={background}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* 要素はキャンバス座標のまま描き、表示範囲の変換は親の <g> 1つでまとめて掛ける */}
            <svg className={styles.svg}>
                <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
                    {elements.map((element) =>
                        element.svgContent ? (
                            // SVG 成果物: data URL で <image> として貼り込む（ベクター品質を維持）
                            <image
                                key={element.id}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(element.svgContent)}`}
                                style={{ cursor: "move" }}
                            />
                        ) : (
                            // プレースホルダー矩形
                            <rect
                                key={element.id}
                                className={styles.element}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                vectorEffect="non-scaling-stroke"
                                style={{ cursor: "move" }}
                            />
                        ),
                    )}
                </g>
            </svg>

            {/* 名前と選択枠は、拡大率に関係なく同じ大きさで見えるようスクリーン座標で描く */}
            {elements.map((element) => {
                const pos = worldToScreen(element, viewport)
                const selected = element.id === selectedId
                return (
                    <div key={element.id}>
                        <span
                            className={`${styles.label} ${selected ? styles.labelSelected : ""}`}
                            style={{ left: pos.x, top: pos.y }}
                        >
                            {element.name}
                        </span>
                        {selected && (
                            <div
                                className={styles.selection}
                                style={{
                                    left: pos.x,
                                    top: pos.y,
                                    width: element.width * viewport.zoom,
                                    height: element.height * viewport.zoom,
                                }}
                            />
                        )}
                    </div>
                )
            })}

            <span className={styles.zoom}>{Math.round(viewport.zoom * 100)}%</span>
        </div>
    )
}
export default Canvas
