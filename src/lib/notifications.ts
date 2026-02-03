import prisma from './prisma'

export class NotificationService {
    static async sendNotification(taskId: number) {
        const task = await prisma.activeTask.findUnique({
            where: { id: taskId },
            include: {
                template: true,
                joiner: { include: { role: true } }
            }
        })

        if (!task || !task.template.ownerEmail) return

        console.log(`[NOTIFICATION] Sending email to ${task.template.ownerEmail}:`)
        console.log(`Subject: New Onboarding Task - ${task.template.title}`)
        console.log(`Body: Hello ${task.template.defaultOwner}, a new onboarding task is ready for ${task.joiner.fullName} (${task.joiner.role.name}).`)
        console.log(`Link: http://localhost:3000?joiner=${task.joiner.id}&confirm=${task.id}`)

        // Update notification status
        await prisma.activeTask.update({
            where: { id: taskId },
            data: {
                isNotified: true,
                notifiedAt: new Date()
            }
        })
    }

    static async triggerNextTask(joinerId: number, currentStep: number) {
        const nextTask = await prisma.activeTask.findFirst({
            where: {
                joinerId,
                template: {
                    stepNumber: {
                        gt: currentStep
                    }
                },
                status: 'PENDING'
            },
            include: { template: true },
            orderBy: { template: { stepNumber: 'asc' } }
        })

        if (nextTask) {
            await this.sendNotification(nextTask.id)
        } else {
            console.log(`[NOTIFICATION] No more tasks for Joiner ${joinerId}. Onboarding complete!`)
            await prisma.joiner.update({
                where: { id: joinerId },
                data: { status: 'COMPLETED' }
            })
        }
    }
}
