'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { addDays } from 'date-fns'

import { NotificationService } from '@/lib/notifications'

export async function createJoiner(data: { fullName: string, roleId: number, startDate: string }) {
    const joiner = await prisma.joiner.create({
        data: {
            fullName: data.fullName,
            roleId: Number(data.roleId),
            startDate: new Date(data.startDate),
            status: 'IN_PROGRESS'
        }
    })

    // Auto-generate tasks for the joiner based on their role
    const templates = await prisma.taskTemplate.findMany({
        where: { roleId: Number(data.roleId) }
    })

    const activeTasks = templates.map(template => ({
        joinerId: joiner.id,
        templateId: template.id,
        dueDate: addDays(new Date(data.startDate), template.timelineDays),
        status: 'PENDING'
    }))

    const createdTasks = await prisma.activeTask.createMany({
        data: activeTasks
    })

    // Trigger notification for the first task (Step 1)
    const firstTask = await prisma.activeTask.findFirst({
        where: { joinerId: joiner.id },
        include: { template: true },
        orderBy: { template: { stepNumber: 'asc' } }
    })

    if (firstTask) {
        await NotificationService.sendNotification(firstTask.id)
    }

    revalidatePath('/dashboard')
    return joiner
}

export async function toggleTaskStatus(taskId: number, currentStatus: string) {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    const completedDate = nextStatus === 'COMPLETED' ? new Date() : null

    const task = await prisma.activeTask.update({
        where: { id: taskId },
        data: {
            status: nextStatus,
            completedDate
        },
        include: { template: true }
    })

    // If task was completed, trigger the next one in sequence
    if (nextStatus === 'COMPLETED') {
        await NotificationService.triggerNextTask(task.joinerId, task.template.stepNumber)
    }

    revalidatePath('/dashboard')
}

export async function getRoles() {
    return await prisma.role.findMany()
}

export async function getJoiners(filters?: {
    name?: string,
    roleId?: string,
    status?: string,
    startDate?: string,
    doneBy?: string
}) {
    const where: any = {}

    if (filters?.name) {
        where.fullName = { contains: filters.name }
    }
    if (filters?.roleId && filters.roleId !== 'all') {
        where.roleId = Number(filters.roleId)
    }
    if (filters?.status && filters.status !== 'all') {
        where.status = filters.status
    }
    if (filters?.startDate) {
        where.startDate = {
            gte: new Date(filters.startDate)
        }
    }
    if (filters?.doneBy && filters.doneBy !== 'all') {
        where.activeTasks = {
            some: {
                template: {
                    defaultOwner: filters.doneBy
                }
            }
        }
    }

    return await prisma.joiner.findMany({
        where,
        include: {
            role: true,
            activeTasks: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getDistinctOwners() {
    const templates = await prisma.taskTemplate.findMany({
        select: { defaultOwner: true },
        distinct: ['defaultOwner']
    })
    return templates.map(t => t.defaultOwner).filter(Boolean)
}

export async function getJoinerDetails(id: number) {
    return await prisma.joiner.findUnique({
        where: { id },
        include: {
            role: true,
            activeTasks: {
                include: { template: true },
                orderBy: { template: { stepNumber: 'asc' } }
            }
        }
    })
}
