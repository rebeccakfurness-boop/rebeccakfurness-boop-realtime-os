import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const rebecca = await prisma.user.upsert({
    where: { email: "rebecca@realtime.local" },
    update: {},
    create: { email: "rebecca@realtime.local", name: "Rebecca Furness", role: "staff", passwordHash: password },
  });

  const staffTwo = await prisma.user.upsert({
    where: { email: "ops@realtime.local" },
    update: {},
    create: { email: "ops@realtime.local", name: "Alex (Ops)", role: "staff", passwordHash: password },
  });

  const school = await prisma.organisation.upsert({
    where: { id: "seed-org-northfield" },
    update: {},
    create: {
      id: "seed-org-northfield",
      name: "Northfield Girls' High School",
      type: "school",
      region: "Auckland",
      source: "Referral",
      pipelineStage: "booked",
      dealValueNzd: 400,
      invoiced: true,
      paidStatus: "unpaid",
    },
  });

  await prisma.user.upsert({
    where: { email: "careers@northfield.school.nz" },
    update: {},
    create: {
      email: "careers@northfield.school.nz",
      name: "Sarah Mitchell",
      role: "business_customer",
      passwordHash: password,
      orgId: school.id,
    },
  });

  await prisma.contact.upsert({
    where: { id: "seed-contact-sarah" },
    update: {},
    create: {
      id: "seed-contact-sarah",
      orgId: school.id,
      name: "Sarah Mitchell",
      title: "Head of Careers",
      email: "careers@northfield.school.nz",
      phone: "+64 21 000 0000",
    },
  });

  await prisma.user.upsert({
    where: { email: "student@realtime.local" },
    update: {},
    create: { email: "student@realtime.local", name: "Jess Taylor", role: "student", passwordHash: password },
  });

  const goal = await prisma.goal.upsert({
    where: { id: "seed-goal-schools" },
    update: {},
    create: {
      id: "seed-goal-schools",
      ownerType: "staff",
      ownerUserId: rebecca.id,
      title: "Book out Term 3 schools calendar",
      description: "Fill every remaining Term 3 slot from 20 July with paid school bookings.",
      category: "schools",
      targetDate: new Date("2026-09-30"),
    },
  });

  await prisma.task.createMany({
    data: [
      { goalId: goal.id, title: "Follow up 5 warm leads from the Youth Leadership Summit", assigneeId: rebecca.id, status: "in_progress", orderIndex: 0 },
      { goalId: goal.id, title: "Send updated proposal template to 3 careers advisors", assigneeId: staffTwo.id, status: "todo", orderIndex: 1 },
      { goalId: goal.id, title: "Confirm Northfield booking in writing", assigneeId: rebecca.id, status: "done", completedAt: new Date(), orderIndex: 2 },
    ],
    skipDuplicates: true,
  });

  await prisma.scholarship.createMany({
    data: [
      {
        title: "Prime Minister's Scholarship for Asia",
        field: "Any",
        region: "National",
        educationLevel: "Undergraduate",
        amount: "Varies",
        deadline: new Date("2026-08-15"),
        description: "Government-funded scholarship supporting study and language immersion in Asia.",
        url: "https://example.govt.nz/pmsa",
      },
      {
        title: "Zhu Xing Global Youth Leadership Fellowship",
        field: "Leadership",
        region: "International",
        educationLevel: "Undergraduate",
        amount: "$5,000",
        deadline: new Date("2026-09-01"),
        description: "Fellowship for young people demonstrating leadership potential across borders.",
        url: "https://example.org/zhu-xing",
      },
      {
        title: "Vice Chancellor's Scholarship for All Around Excellence",
        field: "Any",
        region: "Auckland",
        educationLevel: "Undergraduate",
        amount: "$10,000",
        deadline: new Date("2026-10-01"),
        description: "For students demonstrating excellence across academic, leadership and personal development.",
        url: "https://example.ac.nz/vc-scholarship",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.document.createMany({
    data: [
      {
        id: "seed-doc-master-resource-guide",
        title: "Master Resource Guide",
        type: "resource",
        content: "The full post-talk resource guide: what to do in the first week, first month and first term after the session.",
        isTemplate: false,
        isPublicResource: true,
        createdById: rebecca.id,
      },
      {
        id: "seed-doc-application-prep-worksheet",
        title: "Application Preparation Worksheet",
        type: "resource",
        content: "A worksheet to map your achievements against the five panel categories before you start any application.",
        isTemplate: false,
        isPublicResource: true,
        createdById: rebecca.id,
      },
      {
        id: "seed-doc-cv-linkedin-guide",
        title: "CV & LinkedIn Guide",
        type: "resource",
        content: "How to turn your five-category achievements into a CV and a LinkedIn profile that actually gets read.",
        isTemplate: false,
        isPublicResource: true,
        createdById: rebecca.id,
      },
      {
        id: "seed-doc-personal-statement-template",
        title: "Personal Statement Template",
        type: "resource",
        content: "The Personal Statement structure: values and fit, leadership, community, academic, an honest moment, and closing.",
        isTemplate: false,
        isPublicResource: true,
        createdById: rebecca.id,
      },
      {
        id: "seed-doc-proposal-template",
        title: "Term Proposal Template",
        type: "proposal",
        content:
          "Dear {{contact_name}},\n\nThank you for the chance to put together a proposal for {{organisation_name}} for {{year_level}} in {{event_date}}.\n\nBest,\nRebecca",
        isTemplate: true,
        variables: ["contact_name", "organisation_name", "year_level", "event_date"],
        createdById: rebecca.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.documentLink.upsert({
    where: { documentId_orgId: { documentId: "seed-doc-proposal-template", orgId: school.id } },
    update: {},
    create: { documentId: "seed-doc-proposal-template", orgId: school.id },
  });

  console.log("Seed complete.");
  console.log("Sign in as:");
  console.log("  staff:             rebecca@realtime.local / password123");
  console.log("  student:           student@realtime.local / password123");
  console.log("  business customer: careers@northfield.school.nz / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
