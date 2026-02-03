'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button/Button'
import Card from '@/components/ui/Card/Card'
import { Plus, X } from 'lucide-react'
import { createJoiner } from '@/app/actions'
import styles from './AddJoinerModal.module.css'

export default function AddJoinerModal({ roles }: { roles: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        await createJoiner({
            fullName: formData.get('fullName') as string,
            roleId: Number(formData.get('roleId')),
            startDate: formData.get('startDate') as string,
        })

        setLoading(false)
        setIsOpen(false)
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus size={18} />
                New Joiner
            </Button>

            {isOpen && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Register New Joiner</h2>
                            <button onClick={() => setIsOpen(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label>Full Name</label>
                                <input name="fullName" placeholder="e.g. Alex Chen" required />
                            </div>

                            <div className={styles.field}>
                                <label>Role</label>
                                <select name="roleId" required>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label>WD Start Date</label>
                                <input name="startDate" type="date" required />
                            </div>

                            <div className={styles.actions}>
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Registering...' : 'Quick Start Onboarding'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
