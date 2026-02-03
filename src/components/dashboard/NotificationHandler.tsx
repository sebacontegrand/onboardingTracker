'use client'

import { useEffect } from 'react'
import { toggleTaskStatus } from '@/app/actions'
import { useRouter, useSearchParams } from 'next/navigation'

export default function NotificationHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const confirmId = searchParams.get('confirm')

    useEffect(() => {
        if (confirmId) {
            const taskId = Number(confirmId)
            // We assume it's pending if someone clicked the link
            toggleTaskStatus(taskId, 'PENDING').then(() => {
                // Clear the query param
                const params = new URLSearchParams(searchParams.toString())
                params.delete('confirm')
                router.replace(`?${params.toString()}`)
            })
        }
    }, [confirmId, router, searchParams])

    return null
}
