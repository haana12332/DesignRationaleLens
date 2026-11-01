import { describe, expect, test } from 'vitest'
import { parseLayerTree } from './layerParser'

// ----------------------------------------------------------------
// テスト用 SVG 定数
// ----------------------------------------------------------------

/**
 * 正常ケース: P_ProductDetail
 * page×1, template×1, organism×3, molecule×2, atom×12
 *
 * P_ProductDetail
 *   T_DetailLayout
 *     O_Header
 *       M_NavBar
 *         A_Logo        (atom 1)
 *         A_CartIcon    (atom 2)
 *       Header_Bg       ← 吸収: O_Header に absorbedIds として追加
 *     O_ProductSection
 *       M_ProductCard
 *         A_ProductImage  (atom 3)
 *         A_ProductTitle  (atom 4)
 *         A_ProductPrice  (atom 5)
 *         A_RatingStars   (atom 6)
 *         A_ReviewCount   (atom 7)
 *       A_AddToCart       (atom 8)
 *       A_Favorite        (atom 9)
 *     O_Recommendations
 *       A_RecHeading      (atom 10)
 *       A_RecItem1        (atom 11)
 *       A_RecItem2        (atom 12)
 */
const SVG_OK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812">
  <defs><clipPath id="clip0"><rect width="375" height="812"/></clipPath></defs>
  <g id="P_ProductDetail">
    <g id="T_DetailLayout">
      <g id="O_Header">
        <g id="M_NavBar">
          <g id="A_Logo"/>
          <g id="A_CartIcon"/>
        </g>
        <g id="Header_Bg"/>
      </g>
      <g id="O_ProductSection">
        <g id="M_ProductCard">
          <g id="A_ProductImage"/>
          <g id="A_ProductTitle"/>
          <g id="A_ProductPrice"/>
          <g id="A_RatingStars"/>
          <g id="A_ReviewCount"/>
        </g>
        <g id="A_AddToCart"/>
        <g id="A_Favorite"/>
      </g>
      <g id="O_Recommendations">
        <g id="A_RecHeading"/>
        <g id="A_RecItem1"/>
        <g id="A_RecItem2"/>
      </g>
    </g>
  </g>
</svg>`

/** E01: 最上位が T_（ページではない） */
const SVG_E01 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812">
  <g id="T_TopLayout">
    <g id="O_Content"/>
  </g>
</svg>`

/** E02: P_ ルートが2つ */
const SVG_E02 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812">
  <g id="P_PageA">
    <g id="T_LayoutA"/>
  </g>
  <g id="P_PageB">
    <g id="T_LayoutB"/>
  </g>
</svg>`

/** E03: M_SearchBox の直下に O_（有機体）→ 分子の子に有機体は不可 */
const SVG_E03 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812">
  <g id="P_Search">
    <g id="T_SearchLayout">
      <g id="O_SearchArea">
        <g id="M_SearchBox">
          <g id="O_SearchInput"/>
        </g>
      </g>
    </g>
  </g>
</svg>`

/**
 * E04: id に日本語（ASCII 外）の文字
 * '\u30ec\u30a4\u30a2\u30a6\u30c8' = レイアウト
 */
const SVG_E04 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812">
  <g id="P_ProductDetail">
    <g id="T_\u30ec\u30a4\u30a2\u30a6\u30c8">
      <g id="O_Header"/>
    </g>
  </g>
</svg>`

/** E05: o_Navigation（小文字接頭辞） */
const SVG_E05 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812">
  <g id="P_Brand">
    <g id="T_Header">
      <g id="o_Navigation">
        <g id="a_Logo"/>
      </g>
    </g>
  </g>
</svg>`

/** 複合: E01 + E03 + E04 */
const SVG_COMBINED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812">
  <g id="T_TopFrame">
    <g id="M_Container">
      <g id="\u30dc\u30c3\u30af\u30b9">
        <g id="O_Inner"/>
      </g>
    </g>
  </g>
</svg>`

// ----------------------------------------------------------------
// テスト
// ----------------------------------------------------------------

const SVG_ID = 'test-svg-id'

describe('parseLayerTree', () => {

    describe('正常ケース: P_ProductDetail', () => {
        test('ok: true を返す', () => {
            const result = parseLayerTree(SVG_OK, SVG_ID)
            expect(result.ok).toBe(true)
        })

        test('page×1, template×1, organism×3, molecule×2, atom×12 のノード数', () => {
            const result = parseLayerTree(SVG_OK, SVG_ID)
            if (!result.ok) throw new Error('expected ok')

            const byLayer = {
                page:     result.nodes.filter(n => n.layer === 'page'),
                template: result.nodes.filter(n => n.layer === 'template'),
                organism: result.nodes.filter(n => n.layer === 'organism'),
                molecule: result.nodes.filter(n => n.layer === 'molecule'),
                atom:     result.nodes.filter(n => n.layer === 'atom'),
            }
            expect(byLayer.page.length).toBe(1)
            expect(byLayer.template.length).toBe(1)
            expect(byLayer.organism.length).toBe(3)
            expect(byLayer.molecule.length).toBe(2)
            expect(byLayer.atom.length).toBe(12)
        })

        test('接頭辞なし要素（Header_Bg）は O_Header に吸収される', () => {
            const result = parseLayerTree(SVG_OK, SVG_ID)
            if (!result.ok) throw new Error('expected ok')

            const oHeader = result.nodes.find(n => n.figmaId === 'O_Header')
            expect(oHeader?.absorbedIds).toContain('Header_Bg')
        })

        test('全ノードに同じ svgId が付く', () => {
            const result = parseLayerTree(SVG_OK, SVG_ID)
            if (!result.ok) throw new Error('expected ok')

            expect(result.nodes.every(n => n.svgId === SVG_ID)).toBe(true)
        })

        test('各ノードの order は兄弟内の 0 始まり連番', () => {
            const result = parseLayerTree(SVG_OK, SVG_ID)
            if (!result.ok) throw new Error('expected ok')

            // T_DetailLayout 直下の有機体は O_Header(0), O_ProductSection(1), O_Recommendations(2)
            const tNode = result.nodes.find(n => n.figmaId === 'T_DetailLayout')
            const organisms = result.nodes
                .filter(n => n.parentId === tNode?.id)
                .sort((a, b) => a.order - b.order)
            expect(organisms.map(n => n.order)).toEqual([0, 1, 2])
        })

        test('<defs> 内の要素はツリーに含まれない', () => {
            const result = parseLayerTree(SVG_OK, SVG_ID)
            if (!result.ok) throw new Error('expected ok')

            expect(result.nodes.some(n => n.figmaId === 'clip0')).toBe(false)
        })
    })

    describe('E01: 最上位が P_ でない', () => {
        test('ok: false を返す', () => {
            expect(parseLayerTree(SVG_E01, SVG_ID).ok).toBe(false)
        })

        test('E01 エラーが含まれる', () => {
            const result = parseLayerTree(SVG_E01, SVG_ID)
            if (result.ok) throw new Error('expected error')
            expect(result.errors.some(e => e.code === 'E01')).toBe(true)
        })
    })

    describe('E02: P_ ルートが2つ以上', () => {
        test('ok: false を返す', () => {
            expect(parseLayerTree(SVG_E02, SVG_ID).ok).toBe(false)
        })

        test('E02 エラーが含まれる', () => {
            const result = parseLayerTree(SVG_E02, SVG_ID)
            if (result.ok) throw new Error('expected error')
            expect(result.errors.some(e => e.code === 'E02')).toBe(true)
        })
    })

    describe('E03: 親子の制約違反', () => {
        test('ok: false を返す', () => {
            expect(parseLayerTree(SVG_E03, SVG_ID).ok).toBe(false)
        })

        test('E03 エラーのパスに M_SearchBox と O_SearchInput が含まれる', () => {
            const result = parseLayerTree(SVG_E03, SVG_ID)
            if (result.ok) throw new Error('expected error')
            const e03 = result.errors.find(e => e.code === 'E03')
            expect(e03?.path).toContain('M_SearchBox')
            expect(e03?.path).toContain('O_SearchInput')
        })
    })

    describe('E04: id に英数字・_ 以外の文字', () => {
        test('ok: false を返す', () => {
            expect(parseLayerTree(SVG_E04, SVG_ID).ok).toBe(false)
        })

        test('E04 エラーが含まれる', () => {
            const result = parseLayerTree(SVG_E04, SVG_ID)
            if (result.ok) throw new Error('expected error')
            expect(result.errors.some(e => e.code === 'E04')).toBe(true)
        })
    })

    describe('E05: 接頭辞の形が崩れている', () => {
        test('ok: false を返す', () => {
            expect(parseLayerTree(SVG_E05, SVG_ID).ok).toBe(false)
        })

        test('E05 エラーが o_Navigation と a_Logo の2件含まれる', () => {
            const result = parseLayerTree(SVG_E05, SVG_ID)
            if (result.ok) throw new Error('expected error')
            const e05s = result.errors.filter(e => e.code === 'E05')
            expect(e05s.length).toBe(2)
        })
    })

    describe('複合エラー: E01 + E03 + E04 が同時に含まれる', () => {
        test('ok: false を返す', () => {
            expect(parseLayerTree(SVG_COMBINED, SVG_ID).ok).toBe(false)
        })

        test('3種類のエラーコードが全て含まれる', () => {
            const result = parseLayerTree(SVG_COMBINED, SVG_ID)
            if (result.ok) throw new Error('expected error')
            const codes = new Set(result.errors.map(e => e.code))
            expect(codes.has('E01')).toBe(true)
            expect(codes.has('E03')).toBe(true)
            expect(codes.has('E04')).toBe(true)
        })

        test('最初の1件で止めずに全エラーを収集する', () => {
            const result = parseLayerTree(SVG_COMBINED, SVG_ID)
            if (result.ok) throw new Error('expected error')
            expect(result.errors.length).toBeGreaterThanOrEqual(3)
        })
    })
})
