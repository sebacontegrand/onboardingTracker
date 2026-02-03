import { PrismaClient } from '@prisma/client'
import { addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
    const role = await prisma.role.findFirst({ where: { name: 'COO' } })
    if (!role) {
        console.error('COO role not found. Please run the seed script first.')
        return
    }

    console.log('Adding sample joiner: Alex Chen...')
    const joiner = await prisma.joiner.create({
        data: {
            fullName: 'Alex Chen',
            roleId: role.id,
            startDate: new Date(),
            status: 'IN_PROGRESS'
        }
    })

    const templates = await prisma.taskTemplate.findMany({
        where: { roleId: role.id }
    })

    const activeTasks = templates.map(template => ({
        joinerId: joiner.id,
        templateId: template.id,
        dueDate: addDays(new Date(), template.timelineDays),
        status: 'PENDING'
    }))

    await prisma.activeTask.createMany({
        data: activeTasks
    })

    console.log('Sample joiner added successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
