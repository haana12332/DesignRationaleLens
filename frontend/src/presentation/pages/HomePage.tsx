import { useState } from "react"
import { Link, useNavigate } from "react-router"

import { paths } from "@/routes"
import * as styles from "./HomePage.css"

export function HomePage() {
    const navigate = useNavigate()
    const [verificationId, setVerificationId] = useState("abc123")
    console.log(2)
    return (
        <div className={styles.container}>
            <h1>ホーム</h1>

            <h2>Link で遷移</h2>
            <ul>
                <li><Link to={paths.design("abc123")}>設計（abc123）へ</Link></li>
                <li><Link to={paths.requirements("abc123")}>要件（abc123）へ</Link></li>
            </ul>

            <h2>navigate で遷移（入力した ID を渡す）</h2>
            <input
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
            />
            <button
                className={styles.button}
                disabled={!verificationId}
                onClick={() => navigate(paths.design(verificationId))}
            >
                設計へ
            </button>
            <button
                className={styles.button}
                disabled={!verificationId}
                onClick={() => navigate(paths.requirements(verificationId))}
            >
                要件へ
            </button>
        </div>
    )
}
