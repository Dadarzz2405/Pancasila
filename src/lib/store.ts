import { seedDiscussions, seedMessages, seedReflections, units } from "@/src/lib/content";
import type { Discussion, Message, Reflection, Unit } from "@/src/lib/types";

type HubStore = {
  discussions: Discussion[];
  messages: Message[];
  reflections: Reflection[];
  units: Unit[];
};

const globalStore = globalThis as typeof globalThis & {
  __pancasilaStore?: HubStore;
};

function createStore(): HubStore {
  return {
    units,
    reflections: [...seedReflections],
    discussions: [...seedDiscussions],
    messages: [...seedMessages],
  };
}

function getStore() {
  if (!globalStore.__pancasilaStore) {
    globalStore.__pancasilaStore = createStore();
  }

  return globalStore.__pancasilaStore;
}

export function listUnits() {
  return getStore().units;
}

export function listReflections(unitId?: string) {
  return getStore().reflections
    .filter((reflection) => reflection.status === "verified")
    .filter((reflection) => !unitId || reflection.unit_id === unitId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addReflection(input: {
  content: string;
  unit_id: string;
  is_anonymous: boolean;
}) {
  const reflection: Reflection = {
    id: crypto.randomUUID(),
    unit_id: input.unit_id,
    author_id: null,
    content: input.content,
    is_anonymous: input.is_anonymous,
    author_name: input.is_anonymous ? "Anonim" : "Peserta",
    status: "verified",
    ai_feedback: null,
    created_at: new Date().toISOString(),
  };

  getStore().reflections.unshift(reflection);
  return reflection;
}

export function listDiscussions(unitId?: string) {
  return getStore().discussions
    .filter((discussion) => discussion.status === "verified")
    .filter((discussion) => !unitId || discussion.unit_id === unitId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addDiscussion(input: {
  unit_id: string;
  title: string;
  content: string;
}) {
  const discussion: Discussion = {
    id: crypto.randomUUID(),
    unit_id: input.unit_id,
    author_id: null,
    title: input.title,
    content: input.content,
    status: "verified",
    ai_feedback: null,
    created_at: new Date().toISOString(),
  };

  getStore().discussions.unshift(discussion);
  return discussion;
}

export function listMessages(discussionId?: string) {
  return getStore().messages
    .filter((message) => !discussionId || message.discussion_id === discussionId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function addMessage(input: { content: string; discussion_id: string }) {
  const message: Message = {
    id: crypto.randomUUID(),
    discussion_id: input.discussion_id,
    author_id: null,
    content: input.content,
    created_at: new Date().toISOString(),
  };

  getStore().messages.push(message);
  return message;
}
