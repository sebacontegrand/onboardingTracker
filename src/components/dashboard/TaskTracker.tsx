'use client'

import styles from './TaskTracker.module.css'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import { CheckCircle2, Circle, ExternalLink, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { toggleTaskStatus } from '@/app/actions'
import { useTransition } from 'react'

export default function TaskTracker({ joiner }: { joiner: any }) {
    const [isPending, startTransition] = useTransition()

    if (!joiner) return null

    const completedCount = joiner.activeTasks.filter((t: any) => t.status === 'COMPLETED').length
    const totalCount = joiner.activeTasks.length
    const nextTaskToComplete = joiner.activeTasks.find((t: any) => t.status !== 'COMPLETED')
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return (
        <div className={styles.tracker}>
            <Card className={styles.headerCard}>
                <div className={styles.headerTop}>
                    <div>
                        <h2>{joiner.fullName}'s Onboarding Journey</h2>
                        <p className={styles.roleSub}>{joiner.role.name} Team Member</p>
                    </div>
                    <div className={styles.progressCircle}>
                        <span className={styles.percent}>{percent}%</span>
                        <span className={styles.label}>Complete</span>
                    </div>
                </div>

                <div className={styles.metrics}>
                    <div className={styles.metric}>
                        <span>Total Tasks</span>
                        <strong>{totalCount}</strong>
                    </div>
                    <div className={styles.metric}>
                        <span>Completed</span>
                        <strong className={styles.successText}>{completedCount}</strong>
                    </div>
                    <div className={styles.metric}>
                        <span>Pending</span>
                        <strong className={styles.pendingText}>{totalCount - completedCount}</strong>
                    </div>
                </div>
            </Card>

            <div className={styles.taskList}>
                {joiner.activeTasks.map((task: any) => {
                    const isCurrent = nextTaskToComplete?.id === task.id

                    return (
                        <div
                            key={task.id}
                            className={`
                                ${styles.taskRow} 
                                ${task.status === 'COMPLETED' ? styles.completed : ''}
                                ${isCurrent ? styles.activeTask : ''}
                            `}
                        >
                            <button
                                className={styles.checkButton}
                                onClick={() => startTransition(() => toggleTaskStatus(task.id, task.status))}
                                disabled={isPending || (!isCurrent && task.status !== 'COMPLETED')} // Enforce sequence
                            >
                                {task.status === 'COMPLETED' ? (
                                    <CheckCircle2 color="var(--success)" size={24} />
                                ) : (
                                    <Circle color={isCurrent ? "var(--primary)" : "var(--border)"} size={24} />
                                )}
                            </button>

                            <div className={styles.taskInfo}>
                                <div className={styles.taskTitleRow}>
                                    <h4>{task.template.title}</h4>
                                    <div className={styles.taskMeta}>
                                        {task.isNotified && task.status !== 'COMPLETED' && (
                                            <Badge variant="warning">NOTIFIED</Badge>
                                        )}
                                        <Badge variant={task.status === 'COMPLETED' ? 'success' : 'primary'}>
                                            {task.status}
                                        </Badge>
                                        <span className={styles.date}>
                                            <Calendar size={12} />
                                            {format(new Date(task.dueDate), 'MMM d')}
                                        </span>
                                    </div>
                                </div>
                                <p className={styles.taskOwner}>
                                    Assigned to: <strong>{task.template.defaultOwner}</strong>
                                    {task.template.ownerEmail && <span className={styles.email}> ({task.template.ownerEmail})</span>}
                                </p>
                            </div>

                            {task.template.toolUrl && (
                                <a href={task.template.toolUrl} target="_blank" className={styles.toolLink}>
                                    <Button size="sm" variant="outline">
                                        Launch Tool <ExternalLink size={14} />
                                    </Button>
                                </a>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

