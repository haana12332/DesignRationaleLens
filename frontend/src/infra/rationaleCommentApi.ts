import { apiClient } from "./apiClient"

/** DB から返ってくるコメントの形 */
export type RationaleComment = {
    id: string
    content: string
    createdAt: string
    updatedAt: string
}

/** 指定レイヤーノードのコメント一覧を取得する */
export async function fetchComments(layerNodeId: string): Promise<RationaleComment[]> {
    return apiClient.get<RationaleComment[]>(`/layer-nodes/${layerNodeId}/comments`)
}

/** コメントを追加する */
export async function addComment(layerNodeId: string, content: string): Promise<RationaleComment> {
    return apiClient.post<RationaleComment>(`/layer-nodes/${layerNodeId}/comments`, { content })
}

/** コメントを削除する */
export async function deleteComment(commentId: string): Promise<void> {
    return apiClient.delete<void>(`/rationale-comments/${commentId}`)
}
