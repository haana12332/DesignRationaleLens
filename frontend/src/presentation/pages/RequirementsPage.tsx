import { Link, useParams } from "react-router"

import { paths } from "../../routes"

export function RequirementsPage() {
    // /requirements/:verification_id の値を受け取る（string | undefined）
    const { verification_id } = useParams<{ verification_id: string }>()

    if (!verification_id) return <p>verification_id がありません</p>

    return (
        <div>
            <h1>要件</h1>
            <p>verification_id: {verification_id}</p>

            <Link to={paths.design(verification_id)}>同じ ID の設計へ</Link>
            {" | "}
            <Link to={paths.home()}>ホームへ戻る</Link>
        </div>
    )
}
