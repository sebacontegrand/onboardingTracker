import prisma from '@/lib/prisma'
import styles from './page.module.css'
import Button from '@/components/ui/Button/Button'
import Card from '@/components/ui/Card/Card'
import Badge from '@/components/ui/Badge/Badge'
import { Plus, Users, CheckCircle, Clock } from 'lucide-react'
import { getJoiners, getRoles, getJoinerDetails, getDistinctOwners } from './actions'
import dynamic from 'next/dynamic'

import JoinerList from '@/components/dashboard/JoinerList'
import Filters from '@/components/dashboard/Filters'
import AddJoinerModal from '@/components/dashboard/AddJoinerModal'
import TaskTracker from '@/components/dashboard/TaskTracker'
import NotificationHandler from '@/components/dashboard/NotificationHandler'
import { Suspense } from 'react'



export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    joiner?: string,
    name?: string,
    roleId?: string,
    status?: string,
    startDate?: string,
    doneBy?: string
  }
}) {
  const params = await searchParams
  const joiners = await getJoiners(params)
  const roles = await getRoles()
  const owners = await getDistinctOwners()

  const selectedId = params.joiner
  const selectedJoiner = selectedId ? await getJoinerDetails(Number(selectedId)) : null

  const totalTasks = joiners.reduce((acc, j) => acc + j.activeTasks.length, 0)
  const completedTasks = joiners.reduce((acc, j) => acc + j.activeTasks.filter((t: any) => t.status === 'COMPLETED').length, 0)
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <main className={styles.container}>
      <Suspense fallback={null}>
        <NotificationHandler />
      </Suspense>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Onboarding Hub</h1>
          <p>Track journeys, automate tasks, welcome new talent.</p>
        </div>
        <AddJoinerModal roles={roles} />
      </header>

      <Filters roles={roles} owners={owners} />

      <section className={styles.stats}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}><Users size={24} color="var(--primary)" /></div>
          <div>
            <h3>{joiners.length}</h3>
            <p>New Joiners</p>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}><CheckCircle size={24} color="var(--success)" /></div>
          <div>
            <h3>{completionRate}%</h3>
            <p>Global Completion</p>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}><Clock size={24} color="var(--warning)" /></div>
          <div>
            <h3>{completedTasks}/{totalTasks}</h3>
            <p>Tasks Finished</p>
          </div>
        </Card>
      </section>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Talent Pipeline</h2>
          </div>
          <JoinerList joiners={joiners} />
        </aside>

        <section className={styles.mainContent}>
          {selectedJoiner ? (
            <TaskTracker joiner={selectedJoiner} />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Users size={48} /></div>
              <h3>Select a joiner to track progress</h3>
              <p>Select a joiner from the sidebar to view their role-specific onboarding timeline.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
