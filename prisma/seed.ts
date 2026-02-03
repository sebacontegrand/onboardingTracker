import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const roles = [
        "Software Engineer",
        "Product Manager",
        "UI/UX Designer",
        "QA Engineer",
        "DevOps Engineer",
        "HR/Ops"
    ]

    console.log('Cleaning up old data...')
    await prisma.activeTask.deleteMany({})
    await prisma.joiner.deleteMany({})
    await prisma.taskTemplate.deleteMany({})
    await prisma.role.deleteMany({})

    console.log('Seeding roles...')
    const roleMap: Record<string, number> = {}
    for (const roleName of roles) {
        const role = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        })
        roleMap[roleName] = role.id
    }

    const tasks = [
        { step: 1, title: "Offer Acceptance", owner: "HR Team", email: "hr@company.com", timeline: 0, roles: ["Software Engineer", "Product Manager", "UI/UX Designer", "QA Engineer", "DevOps Engineer", "HR/Ops"] },
        { step: 2, title: "Provision Laptop & Hardware", owner: "IT Support", email: "it@company.com", timeline: 2, roles: ["Software Engineer", "Product Manager", "UI/UX Designer", "QA Engineer", "DevOps Engineer"] },
        { step: 3, title: "Setup GitHub & Tooling Access", owner: "Engineering Lead", email: "eng-lead@company.com", timeline: 0, roles: ["Software Engineer", "QA Engineer", "DevOps Engineer"] },
        { step: 4, title: "Intro to Product Roadmap", owner: "Product Head", email: "product@company.com", timeline: 2, roles: ["Software Engineer", "Product Manager", "UI/UX Designer"] },
        { step: 5, title: "Development Environment Setup", owner: "Tech Lead", email: "tech-lead@company.com", timeline: 4, roles: ["Software Engineer", "DevOps Engineer"] },
        { step: 6, title: "First Sprint Planning", owner: "Scrum Master", email: "scrum@company.com", timeline: 5, roles: ["Software Engineer", "Product Manager", "UI/UX Designer", "QA Engineer"] },
        { step: 7, title: "Join Slack Channels", owner: "HR Team", email: "hr@company.com", timeline: 5, roles: ["Software Engineer", "Product Manager", "UI/UX Designer", "QA Engineer", "DevOps Engineer", "HR/Ops"] },
        { step: 8, title: "Shadowing Sessions", owner: "Buddy", email: "buddy@company.com", timeline: 5, roles: ["Software Engineer", "Product Manager", "UI/UX Designer", "QA Engineer"] }
    ]

    console.log('Seeding task templates...')
    for (const t of tasks) {
        for (const roleName of t.roles) {
            const roleId = roleMap[roleName]
            await prisma.taskTemplate.create({
                data: {
                    title: t.title,
                    stepNumber: t.step,
                    defaultOwner: t.owner,
                    ownerEmail: t.email,
                    timelineDays: t.timeline,
                    roleId: roleId
                }
            })
        }
    }

    console.log('Seeding mock joiners and active tasks...')
    const mockJoiners = [
        { fullName: "Alice Johnson", roleName: "Software Engineer", daysOffset: -15 },
        { fullName: "Bob Smith", roleName: "Product Manager", daysOffset: -5 },
        { fullName: "Charlie Brown", roleName: "UI/UX Designer", daysOffset: 2 }
    ]

    for (const mj of mockJoiners) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + mj.daysOffset)

        const joiner = await prisma.joiner.create({
            data: {
                fullName: mj.fullName,
                startDate: startDate,
                roleId: roleMap[mj.roleName],
                status: mj.daysOffset < 0 ? "IN_PROGRESS" : "NOT_STARTED"
            }
        })

        // Get templates for this role
        const templates = await prisma.taskTemplate.findMany({
            where: { roleId: joiner.roleId },
            orderBy: { stepNumber: 'asc' }
        })

        for (const template of templates) {
            const dueDate = new Date(startDate)
            dueDate.setDate(dueDate.getDate() + template.timelineDays)

            const isPast = dueDate < new Date()
            const status = isPast && Math.random() > 0.3 ? "COMPLETED" : "PENDING"

            await prisma.activeTask.create({
                data: {
                    joinerId: joiner.id,
                    templateId: template.id,
                    dueDate: dueDate,
                    status: status,
                    completedDate: status === "COMPLETED" ? dueDate : null
                }
            })
        }
    }

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
