import { Link, useParams } from "react-router"

import { paths } from "../../routes"

export function DesignPage() {
    // /design/:verification_id の値を受け取る（string | undefined）
    const { verification_id } = useParams<{ verification_id: string }>()

    if (!verification_id) return <p>verification_id がありません</p>

    return (
        <div>
            <h1>設計</h1>
            <p>verification_id: {verification_id}</p>

            <Link to={paths.requirements(verification_id)}>同じ ID の要件へ</Link>
            {" | "}
            <Link to={paths.home()}>ホームへ戻る</Link>
        </div>
    )
}
