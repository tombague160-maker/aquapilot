"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { Bot, Loader2, Send, Trash2, User } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AquariumAssistantChatProps = {
  aquariumId: string;
  isConfigured: boolean;
};

const starterQuestions = [
  "Que dois-je faire aujourd'hui ?",
  "Mes parametres sont-ils bons ?",
  "Pourquoi mes nitrates montent ?",
  "Est-ce que je peux ajouter ce poisson ?",
  "Mon bac est-il surpeuple ?",
  "Quelle quantite d'eau dois-je changer ?",
  "Pourquoi mes plantes jaunissent ?",
  "Comment reduire les algues ?",
  "Quel est le probleme le plus urgent ?",
  "Fais-moi un plan d'entretien de la semaine.",
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AquariumAssistantChat({
  aquariumId,
  isConfigured,
}: AquariumAssistantChatProps) {
  const storageKey = useMemo(
    () => `aquapilot:assistant:${aquariumId}`,
    [aquariumId]
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const rawHistory = window.localStorage.getItem(
      `aquapilot:assistant:${aquariumId}`
    );

    if (!rawHistory) {
      return [];
    }

    try {
      const parsedHistory = JSON.parse(rawHistory) as ChatMessage[];

      return parsedHistory.filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string"
      );
    } catch {
      window.localStorage.removeItem(`aquapilot:assistant:${aquariumId}`);
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-20)));
  }, [messages, storageKey]);

  function clearHistory() {
    setMessages([]);
    setError(null);
    window.localStorage.removeItem(storageKey);
  }

  function submitMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isPending || !isConfigured) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedMessage,
    };
    const history = messages.slice(-10).map(({ role, content }) => ({
      role,
      content,
    }));

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setError(null);

    startTransition(() => {
      void fetch(`/api/aquariums/${aquariumId}/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          history,
        }),
      })
        .then(async (response) => {
          const payload = (await response.json().catch(() => ({}))) as {
            answer?: string;
            error?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error ?? "Erreur assistant.");
          }

          if (!payload.answer) {
            throw new Error("L'assistant n'a pas renvoye de reponse.");
          }

          const answer = payload.answer;

          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: createMessageId(),
              role: "assistant",
              content: answer,
            },
          ]);
        })
        .catch((requestError: Error) => {
          setError(requestError.message);
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: createMessageId(),
              role: "assistant",
              content: `Erreur : ${requestError.message}`,
            },
          ]);
        });
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/5">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Chat contextualise
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Historique conserve localement dans ce navigateur.
          </p>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Effacer
        </button>
      </div>

      {!isConfigured ? (
        <div className="mx-5 mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          OPENAI_API_KEY n&apos;est pas configuree sur le serveur. Ajoute cette
          variable d&apos;environnement pour activer l&apos;assistant IA.
        </div>
      ) : null}

      <div className="max-h-[560px] min-h-96 overflow-y-auto p-5">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" ? (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                    <Bot className="size-4" aria-hidden="true" />
                  </span>
                ) : null}
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-cyan-700 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === "user" ? (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <User className="size-4" aria-hidden="true" />
                  </span>
                ) : null}
              </article>
            ))}
            {isPending ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Analyse du contexte aquarium...
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <Bot className="size-11 text-cyan-700" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-950">
              Pose une question sur ce bac
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
              L&apos;assistant utilisera uniquement les donnees disponibles dans
              AquaPilot pour ce compte et cet aquarium.
            </p>
          </div>
        )}
      </div>

      {error ? (
        <p className="mx-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="border-t border-slate-200 p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {starterQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={!isConfigured || isPending}
              onClick={() => submitMessage(question)}
              className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-left text-xs font-medium text-cyan-800 transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            disabled={!isConfigured || isPending}
            placeholder="Ex. Pourquoi mes nitrates montent ?"
            className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={!isConfigured || isPending || input.trim().length === 0}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-5 text-sm font-medium text-white transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-4" aria-hidden="true" />
            Envoyer
          </button>
        </form>
      </div>
    </section>
  );
}
