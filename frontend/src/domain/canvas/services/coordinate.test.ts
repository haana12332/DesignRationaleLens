import { describe,expect,test }  from "vitest"

import { worldToScreen,screenToWorld,zoomAtPoint } from "./coordinate"

import type { Viewport } from "@/domain/canvas/entities/Viewport"
import type { Point } from "../entities/Point"

describe('worldToScreenとscreenToWorld',() => {
    test('お互いに逆関数',()=>{
        const viewport:Viewport ={x:50,y:50,zoom:1}
        const original:Point ={x:10,y:10}

        const screen = worldToScreen(original, viewport);
        const back = screenToWorld(screen, viewport);

        expect(back.x).toBeCloseTo(original.x);
        expect(back.y).toBeCloseTo(original.y);
    })
})

describe('zoomAtPoint',()=>{
    test('ズーム前後でscreenPointが指すWorld座標が変化しない',()=>{
        const viewport:Viewport = {x:50,y:50,zoom:1}
        const screenPoint:Point = {x:100, y:120} //worldPoint:150,150
        const factor = 2

        const beforeWorldPoint = screenToWorld(screenPoint,viewport)
        const newViewport = zoomAtPoint(screenPoint,viewport,factor)
        const afterWorldPoint = screenToWorld(screenPoint,newViewport)

        expect(beforeWorldPoint.x).toBeCloseTo(afterWorldPoint.x)
        expect(beforeWorldPoint.y).toBeCloseTo(afterWorldPoint.y)


    })
})