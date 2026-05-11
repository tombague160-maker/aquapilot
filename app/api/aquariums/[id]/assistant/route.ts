import { NextResponse } from "next/server";
import { z } from "zod";

import { buildAquariumAiContextForUser } from "@/ai/aquarium-ai-context";
import { getCurrentUser } from "@/lib/auth/session";

const assistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(6000),
      })
    )
    .max(12)
    .optional()
    .default([]),
});

const AQUARIUM_ASSISTANT_INSTRUCTIONS = `
Tu es l'assistant IA contextualise d'AquaPilot, une application de gestion
d'aquariums d'eau douce. Tu reponds uniquement en francais.

Contraintes strictes :
- Ne jamais inventer de donnees.
- Si une information n'est pas dans le contexte, indique-la dans "Donnees manquantes".
- Ne donne pas de certitude absolue si les donnees sont incompletes.
- Priorise la securite du vivant : NO2/NH3/NH4, temperature, alertes critiques,
  entretien en retard, puis confort et optimisation.
- Pour les volumes ou changements d'eau, explique le calcul si les donnees le permettent.
- Pour l'ajout d'une espece, analyse volume, groupe, temperature, pH/GH et compatibilite.

Format de reponse obligatoire en Markdown :
## Resume
## Diagnostic
## Priorite
## Niveau de confiance
## Actions recommandees
## Risques si rien n'est fait
## Donnees manquantes
`;

type OpenAiResponseShape = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

function buildAssistantInput(input: {
  context: unknown;
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const historyText =
    input.history.length > 0
      ? input.history
          .slice(-8)
          .map((item) => `${item.role === "user" ? "Utilisateur" : "Assistant"}: ${item.content}`)
          .join("\n\n")
      : "Aucun historique local transmis.";

  return `
Contexte aquarium JSON :
${JSON.stringify(input.context, null, 2)}

Historique local recent :
${historyText}

Question utilisateur :
${input.message}
`;
}

function extractOpenAiText(payload: OpenAiResponseShape) {
  if (payload.output_text) {
    return payload.output_text;
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
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

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY n'est pas configuree. Ajoute la variable d'environnement cote serveur pour activer l'assistant IA.",
        isConfigured: false,
      },
      { status: 503 }
    );
  }

  const { id } = await props.params;
  const body = await request.json().catch(() => null);
  const parsedBody = assistantRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Message invalide ou trop long.",
      },
      { status: 400 }
    );
  }

  const context = await buildAquariumAiContextForUser(user.id, id);

  if (!context) {
    return NextResponse.json(
      {
        error: "Aquarium introuvable ou inaccessible.",
      },
      { status: 404 }
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: AQUARIUM_ASSISTANT_INSTRUCTIONS,
      input: buildAssistantInput({
        context,
        message: parsedBody.data.message,
        history: parsedBody.data.history,
      }),
      max_output_tokens: 1400,
      store: false,
    }),
  });
  const payload = (await openAiResponse.json().catch(() => ({}))) as OpenAiResponseShape;

  if (!openAiResponse.ok) {
    return NextResponse.json(
      {
        error:
          payload.error?.message ??
          "OpenAI a renvoye une erreur pendant la generation.",
      },
      { status: 502 }
    );
  }

  const answer = extractOpenAiText(payload);

  if (!answer) {
    return NextResponse.json(
      {
        error: "OpenAI n'a pas renvoye de texte exploitable.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    answer,
    model,
    isConfigured: true,
  });
}
