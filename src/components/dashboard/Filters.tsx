'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './Filters.module.css'
import { Search, Filter, X } from 'lucide-react'
import Button from '@/components/ui/Button/Button'

interface FiltersProps {
    roles: { id: number, name: string }[]
    owners: string[]
}

export default function Filters({ roles, owners }: FiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push('/')
    }

    const hasFilters = searchParams.size > 0 && !(searchParams.size === 1 && searchParams.has('joiner'))

    return (
        <div className={styles.container}>
            <div className={styles.filterRow}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Filter by name..."
                        value={searchParams.get('name') || ''}
                        onChange={(e) => updateFilter('name', e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.selectBox}>
                    <Filter size={16} className={styles.filterIcon} />
                    <select
                        value={searchParams.get('roleId') || 'all'}
                        onChange={(e) => updateFilter('roleId', e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectBox}>
                    <Filter size={16} className={styles.filterIcon} />
                    <select
                        value={searchParams.get('status') || 'all'}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">All Statuses</option>
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>

                <div className={styles.selectBox}>
                    <Filter size={16} className={styles.filterIcon} />
                    <select
                        value={searchParams.get('doneBy') || 'all'}
                        onChange={(e) => updateFilter('doneBy', e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">Done by (Owner)</option>
                        {owners.map(owner => (
                            <option key={owner} value={owner}>{owner}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.dateBox}>
                    <input
                        type="date"
                        value={searchParams.get('startDate') || ''}
                        onChange={(e) => updateFilter('startDate', e.target.value)}
                        className={styles.dateInput}
                    />
                </div>

                {hasFilters && (
                    <Button
                        variant="secondary"
                        onClick={clearFilters}
                        className={styles.clearButton}
                    >
                        <X size={14} /> Clear
                    </Button>
                )}
            </div>
        </div>
    )
}
