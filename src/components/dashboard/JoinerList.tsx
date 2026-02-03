'use client'

import styles from './JoinerList.module.css'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

export default function JoinerList({ joiners }: { joiners: any[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedId = searchParams.get('joiner')

    return (
        <div className={styles.list}>
            {joiners.map(joiner => {
                const completed = joiner.activeTasks.filter((t: any) => t.status === 'COMPLETED').length
                const total = joiner.activeTasks.length
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                const isSelected = selectedId === String(joiner.id)

                return (
                    <Card
                        key={joiner.id}
                        className={`${styles.joinerCard} ${isSelected ? styles.selected : ''}`}
                        onClick={() => router.push(`?joiner=${joiner.id}`)}
                    >
                        <div className={styles.joinerInfo}>
                            <div className={styles.avatar}>
                                {joiner.fullName.charAt(0)}
                            </div>
                            <div className={styles.details}>
                                <span className={styles.joinerId}>#{joiner.id}</span>
                                <h4>{joiner.fullName}</h4>
                                <p>{joiner.role.name} • Start {format(new Date(joiner.startDate), 'MMM d')}</p>
                            </div>
                        </div>

                        <div className={styles.progressContainer}>
                            <div className={styles.progressText}>
                                <span>Progress</span>
                                <span>{percent}%</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
