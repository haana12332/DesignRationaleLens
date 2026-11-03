import { useEffect, useMemo, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

import type { Offset, Point, Viewport } from "@/domain/canvas"
import { screenToWorld, worldToScreen } from "@/domain/canvas"
import type { GuiElement } from "@/domain/guiElement"
import { findElementAt } from "@/domain/guiElement"
import type { LayerNode } from "@/domain/layerTree"
import type { LocalBboxMap } from "@/presentation/hooks/useLayerBBoxes"
import * as styles from "./Canvas.css"

type Props = {
    viewport: Viewport
    elements: readonly GuiElement[]
    layerNodes: readonly LayerNode[]
    /** useLayerBBoxes で計測した SVG ローカル座標の bbox。Canvas が element.x/y を加算して世界座標にする */
    layerBBoxes: LocalBboxMap
    selectedLayerNodeId: string | null
    onPan: (offset: Offset) => void
    onZoom: (screenPoint: Point, factor: number) => void
    /** 要素をドラッグ移動したときのワールド座標デルタ */
    onMoveElement: (id: string, dx: number, dy: number) => void
    /** レイヤーノードの選択変更（null = 選択解除） */
    onSelectLayerNode: (id: string | null) => void
}

const CLICK_TOLERANCE = 3
const GRID_SIZE = 20
/** スクリーン座標でのコーナーハンドルサイズ (px) */
const HANDLE_SIZE = 6
/** スマートガイドの延長余白 (world coords) */
const GUIDE_PADDING = 20
/** スマートガイドのエッジ一致許容誤差 (world coords) */
const GUIDE_TOLERANCE = 0.5

type DragState =
    | { mode: "canvas"; start: Point; last: Point; moved: boolean }
    | { mode: "element"; id: string; start: Point; last: Point; moved: boolean }

/**
 * 無限キャンバス。
 * - 要素の上でドラッグ → GUI 成果物ごと移動
 * - 背景でドラッグ / ホイール → パン、Ctrl+ホイール → ズーム
 * - クリック → その位置の最小レイヤーを選択、背景クリック → 選択解除
 * - ホバー → レイヤーの輪郭を薄くハイライト
 * 状態は持たず（hover は除く）、操作があったら props のコールバックで親に知らせる。
 */
function Canvas({
    viewport, elements, layerNodes, layerBBoxes,
    selectedLayerNodeId, onPan, onZoom, onMoveElement, onSelectLayerNode,
}: Props) {
    const rootRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<DragState | null>(null)

    /**
     * クリック・ホバーの対象となるレイヤーノードを選択状態に応じて絞り込む。
     *
     * - 未選択: P_ レベル（parentId === null）のみ
     * - 選択中: 同じ親を持つ兄弟ノード（同一層）＋ 選択中ノードの直下の子ノード
     *
     * 同一層の別オブジェクトへはいつでもホバー・選択できる。
     * さらに選択中オブジェクトの中へ一段階掘り下げることもできる。
     */
    const allowedLayerNodes = useMemo(() => {
        if (selectedLayerNodeId === null) {
            return layerNodes.filter((n) => n.parentId === null)
        }
        const selectedNode = layerNodes.find((n) => n.id === selectedLayerNodeId)
        if (!selectedNode) return []
        return layerNodes.filter(
            (n) =>
                n.parentId === selectedNode.parentId || // 同一層の兄弟
                n.parentId === selectedLayerNodeId,     // 一段下の子
        )
    }, [selectedLayerNodeId, layerNodes])

    // ホバー中のレイヤーノード ID（ドラッグ中は null）
    const [hoveredLayerNodeId, setHoveredLayerNodeId] = useState<string | null>(null)
    // 連続した pointermove で setState を最小限に抑えるための前回値
    const lastHoveredRef = useRef<string | null>(null)

    // ホイールのリスナーからも最新コールバックを参照できるようにする
    const latest = useRef({ onPan, onZoom })
    useEffect(() => { latest.current = { onPan, onZoom } })

    // passive: false でホイールのブラウザデフォルト（ページスクロール）を止める
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

    /** イベント座標をキャンバス左上からのスクリーン座標に変換 */
    function toScreen(event: { clientX: number; clientY: number }): Point {
        const rect = rootRef.current?.getBoundingClientRect()
        return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) }
    }

    /**
     * ワールド座標でレイヤーのヒットテストを行い、クリックされたレイヤーノード ID を返す。
     * 複数レイヤーが重なる場合は面積最小（最も詳細）なノードを選ぶ。
     * P_ ページ全体より A_ アトムが優先されるため、Figma に近い操作感になる。
     */
    function findLayerAtPoint(worldPoint: Point): string | null {
        let bestId: string | null = null
        let bestArea = Infinity

        for (const node of allowedLayerNodes) {
            const local = layerBBoxes.get(node.id)
            if (!local) continue
            const element = elements.find((e) => e.id === node.svgId)
            if (!element) continue

            const wx = element.x + local.x
            const wy = element.y + local.y

            if (
                worldPoint.x >= wx && worldPoint.x <= wx + local.width &&
                worldPoint.y >= wy && worldPoint.y <= wy + local.height
            ) {
                const area = local.width * local.height
                if (area < bestArea) {
                    bestArea = area
                    bestId = node.id
                }
            }
        }
        return bestId
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        if (event.button !== 0 && event.button !== 1) return
        event.currentTarget.setPointerCapture(event.pointerId)
        const screen = toScreen(event)

        // ドラッグ開始でホバーをリセット
        lastHoveredRef.current = null
        setHoveredLayerNodeId(null)

        if (event.button === 1) {
            dragRef.current = { mode: "canvas", start: screen, last: screen, moved: false }
            return
        }

        // 左ボタン: GUI 成果物にヒットしたら要素ドラッグ、背景ならキャンバスパン
        const world = screenToWorld(screen, viewport)
        const hit = findElementAt(elements, world)

        dragRef.current = hit
            ? { mode: "element", id: hit.id, start: screen, last: screen, moved: false }
            : { mode: "canvas", start: screen, last: screen, moved: false }
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const screen = toScreen(event)
        const drag = dragRef.current

        if (!drag) {
            // ドラッグ中でないときはホバー検出
            const world = screenToWorld(screen, viewport)
            const hoveredId = findLayerAtPoint(world)
            if (hoveredId !== lastHoveredRef.current) {
                lastHoveredRef.current = hoveredId
                setHoveredLayerNodeId(hoveredId)
            }
            return
        }

        const distance = Math.hypot(screen.x - drag.start.x, screen.y - drag.start.y)
        if (!drag.moved && distance < CLICK_TOLERANCE) return

        const dx = screen.x - drag.last.x
        const dy = screen.y - drag.last.y

        if (drag.mode === "element") {
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
            const world = screenToWorld(toScreen(event), viewport)
            const hitId = findLayerAtPoint(world)

            if (hitId !== null) {
                // 許容レイヤーにヒット → 1段階掘り下げて選択
                onSelectLayerNode(hitId)
            } else {
                // 許容レイヤー外をクリック → 選択を完全にリセット
                onSelectLayerNode(null)
            }
        }
    }

    function handlePointerLeave() {
        lastHoveredRef.current = null
        setHoveredLayerNodeId(null)
    }

    // 点のグリッド
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
            className={`${styles.root}${hoveredLayerNodeId ? ` ${styles.rootLayerHovered}` : ""}`}
            style={background}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerLeave}
        >
            <svg className={styles.svg}>
                <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
                    {/* GUI 成果物の SVG 表示 */}
                    {elements.map((element) =>
                        element.svgContent ? (
                            <image
                                key={element.id}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(element.svgContent)}`}
                            />
                        ) : (
                            <rect
                                key={element.id}
                                className={styles.element}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                vectorEffect="non-scaling-stroke"
                            />
                        ),
                    )}

                    {/* レイヤーオーバーレイ: ホバー輪郭・選択ハイライト */}
                    {layerNodes.map((node) => {
                        const local = layerBBoxes.get(node.id)
                        if (!local) return null
                        const element = elements.find((e) => e.id === node.svgId)
                        if (!element) return null

                        // ホバー中のみ境界線を表示。選択後は非表示。
                        const isSelected = node.id === selectedLayerNodeId
                        const isHovered = node.id === hoveredLayerNodeId && !isSelected
                        if (!isHovered) return null

                        return (
                            <rect
                                key={`overlay-${node.id}`}
                                className={styles.layerHoverOverlay}
                                x={element.x + local.x}
                                y={element.y + local.y}
                                width={local.width}
                                height={local.height}
                            />
                        )
                    })}

                    {/* 選択オーバーレイ: バウンディングボックス・コーナーハンドル・スマートガイド */}
                    {(() => {
                        if (!selectedLayerNodeId) return null
                        const selNode = layerNodes.find((n) => n.id === selectedLayerNodeId)
                        if (!selNode) return null
                        const selLocal = layerBBoxes.get(selNode.id)
                        if (!selLocal) return null
                        const selEl = elements.find((e) => e.id === selNode.svgId)
                        if (!selEl) return null

                        const wx = selEl.x + selLocal.x
                        const wy = selEl.y + selLocal.y
                        const ww = selLocal.width
                        const wh = selLocal.height

                        // ハンドルサイズは zoom に反比例させてスクリーン上で一定サイズにする
                        const hs = HANDLE_SIZE / viewport.zoom
                        const hh = hs / 2

                        // スマートガイド: 同じ親の兄弟ノードとエッジが一致する位置に破線を引く
                        const guides: { axis: "h" | "v"; pos: number; from: number; to: number }[] = []
                        const siblings = layerNodes.filter(
                            (n) => n.parentId === selNode.parentId && n.id !== selNode.id,
                        )
                        for (const sib of siblings) {
                            const sibLocal = layerBBoxes.get(sib.id)
                            if (!sibLocal) continue
                            const sibEl = elements.find((e) => e.id === sib.svgId)
                            if (!sibEl) continue
                            const sx = sibEl.x + sibLocal.x
                            const sy = sibEl.y + sibLocal.y
                            const sw = sibLocal.width
                            const sh = sibLocal.height

                            // 縦方向ガイド（左右エッジの一致）
                            for (const selX of [wx, wx + ww]) {
                                for (const sibX of [sx, sx + sw]) {
                                    if (Math.abs(selX - sibX) <= GUIDE_TOLERANCE) {
                                        guides.push({
                                            axis: "v", pos: selX,
                                            from: Math.min(wy, sy) - GUIDE_PADDING,
                                            to: Math.max(wy + wh, sy + sh) + GUIDE_PADDING,
                                        })
                                    }
                                }
                            }

                            // 横方向ガイド（上下エッジの一致）
                            for (const selY of [wy, wy + wh]) {
                                for (const sibY of [sy, sy + sh]) {
                                    if (Math.abs(selY - sibY) <= GUIDE_TOLERANCE) {
                                        guides.push({
                                            axis: "h", pos: selY,
                                            from: Math.min(wx, sx) - GUIDE_PADDING,
                                            to: Math.max(wx + ww, sx + sw) + GUIDE_PADDING,
                                        })
                                    }
                                }
                            }
                        }

                        return (
                            <>
                                {guides.map((g, i) => (
                                    <line
                                        key={`guide-${i}`}
                                        className={styles.smartGuide}
                                        x1={g.axis === "v" ? g.pos : g.from}
                                        y1={g.axis === "v" ? g.from : g.pos}
                                        x2={g.axis === "v" ? g.pos : g.to}
                                        y2={g.axis === "v" ? g.to : g.pos}
                                    />
                                ))}

                                {/* バウンディングボックス（青い実線） */}
                                <rect
                                    className={styles.layerSelectedOverlay}
                                    x={wx} y={wy}
                                    width={ww} height={wh}
                                />

                                {/* コーナーハンドル（白い四角、4隅） */}
                                {([
                                    [wx - hh,      wy - hh     ],
                                    [wx + ww - hh, wy - hh     ],
                                    [wx - hh,      wy + wh - hh],
                                    [wx + ww - hh, wy + wh - hh],
                                ] as [number, number][]).map(([hx, hy], i) => (
                                    <rect
                                        key={`handle-${i}`}
                                        className={styles.cornerHandle}
                                        x={hx} y={hy}
                                        width={hs} height={hs}
                                    />
                                ))}
                            </>
                        )
                    })()}
                </g>
            </svg>

            {elements.map((element) => {
                const pos = worldToScreen(element, viewport)
                // ホバー中または選択中のレイヤーノードがこの element に属していれば active
                const isActive =
                    (hoveredLayerNodeId !== null &&
                        layerNodes.find((n) => n.id === hoveredLayerNodeId)?.svgId === element.id) ||
                    (selectedLayerNodeId !== null &&
                        layerNodes.find((n) => n.id === selectedLayerNodeId)?.svgId === element.id)
                return (
                    <span
                        key={element.id}
                        className={`${styles.label}${isActive ? ` ${styles.labelActive}` : ""}`}
                        style={{ left: pos.x, top: pos.y }}
                    >
                        {element.name}
                    </span>
                )
            })}

            <span className={styles.zoom}>{Math.round(viewport.zoom * 100)}%</span>
        </div>
    )
}
export default Canvas
