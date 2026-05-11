import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;
const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function isAllowedImageType(
  type: string
): type is keyof typeof allowedImageTypes {
  return type in allowedImageTypes;
}

export async function POST(
  request: Request,
  props: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Authentification requise.",
      },
      { status: 401 }
    );
  }

  const { id } = await props.params;
  const aquarium = await prisma.aquarium.findFirst({
    where: {
      id,
      userId: user.id,
      isArchived: false,
    },
    select: {
      id: true,
    },
  });

  if (!aquarium) {
    return NextResponse.json(
      {
        error: "Aquarium introuvable ou inaccessible.",
      },
      { status: 404 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const uploadedFile = formData?.get("photo");

  if (!(uploadedFile instanceof File)) {
    return NextResponse.json(
      {
        error: "Aucune image valide n'a ete envoyee.",
      },
      { status: 400 }
    );
  }

  if (!isAllowedImageType(uploadedFile.type)) {
    return NextResponse.json(
      {
        error: "Format non supporte. Utilise JPG, PNG ou WebP.",
      },
      { status: 400 }
    );
  }

  if (uploadedFile.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "Image trop lourde. La limite est de 6 Mo.",
      },
      { status: 413 }
    );
  }

  const extension = allowedImageTypes[uploadedFile.type];
  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "aquariums"
  );
  const fileName = `${aquarium.id}-${Date.now()}.${extension}`;
  const filePath = path.join(uploadDirectory, fileName);
  const publicUrl = `/uploads/aquariums/${fileName}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(filePath, Buffer.from(await uploadedFile.arrayBuffer()));

  await prisma.aquarium.update({
    where: {
      id: aquarium.id,
    },
    data: {
      photoUrl: publicUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/aquariums");
  revalidatePath(`/aquariums/${aquarium.id}`);

  return NextResponse.json({
    photoUrl: publicUrl,
  });
}
