import replicateClient from "@/core/clients/replicate";
import db from "@/core/db";
import { replacePromptToken } from "@/core/utils/predictions";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const prompt = req.body.prompt as string;
  const seed = req.body.seed as number;
  const image = req.body.image as string;

  const projectId = req.query.id as string;
  console.log('projectId>>>>', projectId)
  console.log('Prompt', prompt)
  console.log('Seed', seed)
  console.log('Image', image)

  // const session = await getSession({ req });
  //
  // if (!session?.user) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  const project = await db.project.findFirstOrThrow({
    where: { id: projectId },
  });

  if (project.credits < 1) {
    return res.status(400).json({ message: "No credit" });
  }

  const { data } = await replicateClient.post(
    `https://api.replicate.com/v1/predictions`,
    {
      input: {
        prompt: replacePromptToken(prompt, project),
        negative_prompt: process.env.REPLICATE_NEGATIVE_PROMPT,
        ...(image && { image }),
        ...(seed && { seed }),
      },
      version: project.modelVersionId,
    }
  );

  console.log('This is data>>>>', data)

  const shot = await db.shot.create({
    data: {
      prompt,
      replicateId: data.id,
      status: "starting",
      projectId: project.id,
    },
  });

  console.log('This is shot>>>>', shot)

  await db.project.update({
    where: { id: project.id },
    data: {
      credits: project.credits - 1,
    },
  });

  console.log('This is project>>>>', project)

  return res.json({ shot });
};

export default handler;
