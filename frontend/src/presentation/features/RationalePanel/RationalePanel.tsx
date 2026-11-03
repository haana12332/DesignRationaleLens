import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { LayerNode, LayerType } from "@/domain/layerTree"
import { LAYER_LABEL_MAP } from "@/domain/layerTree"
import { addComment, deleteComment, fetchComments } from "@/infra/rationaleCommentApi"
import * as styles from "./RationalePanel.css"

type Props = {
    node: LayerNode
}

const LAYER_COLOR: Record<LayerType, string> = {
    page:     "#2563eb",
    template: "#7c3aed",
    organism: "#059669",
    molecule: "#d97706",
    atom:     "#6b7280",
}

/**
 * 設計根拠パネル（右サイドバー）。
 * 選択中のレイヤーノードに紐付いたコメントを表示・追加・削除する。
 */
export function RationalePanel({ node }: Props) {
    const queryClient = useQueryClient()
    const queryKey = ["rationale-comments", node.id]

    const { data: comments, isLoading } = useQuery({
        queryKey,
        queryFn: () => fetchComments(node.id),
    })

    const [draft, setDraft] = useState("")

    const addMutation = useMutation({
        mutationFn: (content: string) => addComment(node.id, content),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey })
            setDraft("")
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (commentId: string) => deleteComment(commentId),
        onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
    })

    function handleAdd() {
        if (draft.trim() === "") return
        addMutation.mutate(draft)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        // Ctrl+Enter / Cmd+Enter で送信
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault()
            handleAdd()
        }
    }

    function formatDate(iso: string) {
        const d = new Date(iso)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }

    return (
        <aside className={styles.panel}>
            {/* ヘッダー: 選択中レイヤーの名前と種別 */}
            <div className={styles.header}>
                <p className={styles.layerLabel} style={{ color: LAYER_COLOR[node.layer] }}>
                    {LAYER_LABEL_MAP[node.layer]}
                </p>
                <p className={styles.layerName}>{node.figmaId}</p>
            </div>

            {/* コメント追加フォーム */}
            <div className={styles.addSection}>
                <p className={styles.addLabel}>設計根拠を追加</p>
                <textarea
                    className={styles.textarea}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="なぜこの設計にしたか…（Ctrl+Enter で追加）"
                />
                <button
                    className={styles.addButton}
                    onClick={handleAdd}
                    disabled={draft.trim() === "" || addMutation.isPending}
                >
                    {addMutation.isPending ? "追加中…" : "追加"}
                </button>
            </div>

            {/* コメント一覧 */}
            <div className={styles.commentList}>
                {isLoading && <p className={styles.loadingText}>読み込み中…</p>}
                {!isLoading && comments?.length === 0 && (
                    <p className={styles.emptyText}>まだコメントはありません</p>
                )}
                {comments?.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                        <p className={styles.commentContent}>{comment.content}</p>
                        <div className={styles.commentMeta}>
                            <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
                            <button
                                className={styles.deleteButton}
                                onClick={() => deleteMutation.mutate(comment.id)}
                                disabled={deleteMutation.isPending}
                                title="削除"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    )
}
