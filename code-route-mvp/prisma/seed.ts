import { PrismaClient } from "@prisma/client";
import questionsData from "../data/questions.sample.json";

const prisma = new PrismaClient();

async function main() {
  for (const q of questionsData.questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        theme: q.theme,
        subtheme: q.subtheme,
        trapFamily: q.trap_family,
        difficulty: q.difficulty,
        type: q.type,
        prompt: q.prompt,
        explanationShort: q.explanation_short,
        explanationLong: q.explanation_short,
        hasImage: q.has_image
      },
      create: {
        id: q.id,
        theme: q.theme,
        subtheme: q.subtheme,
        trapFamily: q.trap_family,
        difficulty: q.difficulty,
        type: q.type,
        prompt: q.prompt,
        explanationShort: q.explanation_short,
        explanationLong: q.explanation_short,
        hasImage: q.has_image,
        choices: {
          create: q.choices.map((c, index) => ({
            id: `${q.id}_${c.id}`,
            position: index,
            text: c.text,
            isCorrect: c.is_correct
          }))
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
