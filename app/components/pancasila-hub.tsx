"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiArrowRightUpLine,
  RiChat3Line,
  RiErrorWarningLine,
  RiGovernmentLine,
  RiQuillPenLine,
  RiSendPlaneFill,
  RiShieldCheckLine,
} from "react-icons/ri";
import type { Discussion, Message, Reflection, Unit } from "@/src/lib/types";
import { units as defaultUnits } from "@/src/lib/content";
import { getCurrentUser } from "@/src/lib/auth";
import { supabase } from "@/src/lib/supabase";

function formatRelativeStamp(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function readJsonOrNull<T>(url: string): Promise<T | null> {
  try {
    return await readJson<T>(url);
  } catch {
    return null;
  }
}

export function PancasilaHub() {
  const [units, setUnits] = useState<Unit[]>(defaultUnits);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [reflectionInput, setReflectionInput] = useState("");
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionInput, setDiscussionInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [postAnonymously, setPostAnonymously] = useState(true);
  const [reflectionError, setReflectionError] = useState("");
  const [discussionError, setDiscussionError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [busyState, setBusyState] = useState<"discussion" | "message" | "reflection" | null>(null);

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId) ?? units[0],
    [selectedUnitId, units],
  );

  const selectedDiscussion = useMemo(
    () => discussions.find((discussion) => discussion.id === selectedDiscussionId) ?? discussions[0],
    [discussions, selectedDiscussionId],
  );

  useEffect(() => {
    const init = async () => {
      try {
        // Do not auto-create sessions. Supabase projects often enable captcha protection,
        // which blocks anonymous sign-in unless a captcha token is provided.
        const user = await getCurrentUser();
        setIsLoggedIn(Boolean(user));
        setCurrentUserId(user?.id ?? "");
        setCurrentUserName(
          (user?.user_metadata?.full_name as string | undefined) ??
            user?.email?.split("@")[0] ??
            "",
        );
      } finally {
        setAuthReady(true);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    void readJsonOrNull<Unit[]>("/api/units").then((data) => {
      if (!data?.length) return;
      setUnits(data);
      setSelectedUnitId((current) => {
        if (current && data.some((unit) => unit.id === current)) {
          return current;
        }
        return data[0].id;
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = Boolean(session?.user);
      setIsLoggedIn(loggedIn);
      setCurrentUserId(session?.user?.id ?? "");
      setCurrentUserName(
        (session?.user?.user_metadata?.full_name as string | undefined) ??
          session?.user?.email?.split("@")[0] ??
          "",
      );
      if (!loggedIn) {
        // Clear discussion state on logout without relying on effects.
        setDiscussions([]);
        setSelectedDiscussionId("");
        setMessages([]);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [authReady]);

  useEffect(() => {
    if (!authReady || !selectedUnitId) {
      return;
    }

    void readJsonOrNull<Reflection[]>(`/api/reflections?unit_id=${selectedUnitId}`).then((data) => {
      if (data) setReflections(data);
    });
    if (!isLoggedIn) return;

    void readJsonOrNull<Discussion[]>(`/api/discussions?unit_id=${selectedUnitId}`).then((data) => {
      if (!data) return;
      setDiscussions(data);
      setSelectedDiscussionId((current) => {
        if (current && data.some((discussion) => discussion.id === current)) {
          return current;
        }

        return data[0]?.id ?? "";
      });
      if (!data[0]) {
        setMessages([]);
      }
    });
  }, [authReady, isLoggedIn, selectedUnitId]);

  useEffect(() => {
    if (!authReady || !isLoggedIn || !selectedDiscussionId) {
      return;
    }

    void readJsonOrNull<Message[]>(`/api/messages?discussion_id=${selectedDiscussionId}`).then((data) => {
      if (data) setMessages(data);
    });
  }, [authReady, isLoggedIn, selectedDiscussionId]);

  useEffect(() => {
    if (!authReady || !isLoggedIn || !selectedDiscussionId) {
      return;
    }

    const channel = supabase
      .channel(`messages:${selectedDiscussionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `discussion_id=eq.${selectedDiscussionId}`,
        },
        (payload) => {
          const message = payload.new as Message;
          setMessages((current) => {
            if (current.some((entry) => entry.id === message.id)) {
              return current;
            }
            return [...current, message];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authReady, isLoggedIn, selectedDiscussionId]);

  async function submitReflection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReflectionError("");
    setBusyState("reflection");

    try {
      const response = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reflectionInput,
          is_anonymous: postAnonymously,
          unit_id: selectedUnitId,
        }),
      });

      const payload = (await response.json()) as Reflection | { error: string };

      if (!response.ok) {
        setReflectionError("error" in payload ? payload.error : "Gagal mengirim refleksi.");
        return;
      }

      setReflectionInput("");
      setReflections((current) => [payload as Reflection, ...current]);
    } finally {
      setBusyState(null);
    }
  }

  async function submitDiscussion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDiscussionError("");
    setBusyState("discussion");

    try {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: discussionTitle,
          content: discussionInput,
          unit_id: selectedUnitId,
        }),
      });

      const payload = (await response.json()) as Discussion | { error: string };

      if (!response.ok) {
        setDiscussionError("error" in payload ? payload.error : "Gagal membuat diskusi.");
        return;
      }

      const discussion = payload as Discussion;
      setDiscussionTitle("");
      setDiscussionInput("");
      setDiscussions((current) => [discussion, ...current]);
      setSelectedDiscussionId(discussion.id);
    } finally {
      setBusyState(null);
    }
  }

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessageError("");

    if (!selectedDiscussionId) {
      setMessageError("Pilih diskusi terlebih dulu.");
      return;
    }

    setBusyState("message");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageInput,
          discussion_id: selectedDiscussionId,
        }),
      });

      const payload = (await response.json()) as Message | { error: string };

      if (!response.ok) {
        setMessageError("error" in payload ? payload.error : "Gagal mengirim pesan.");
        return;
      }

      setMessageInput("");
      setMessages((current) => {
        const message = payload as Message;
        if (current.some((entry) => entry.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    } finally {
      setBusyState(null);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6db_0%,#fff9f1_22%,#f7f0ea_46%,#f5efec_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-b border-white/50 bg-[#9d1418] px-6 py-8 text-white lg:w-[320px] lg:border-b-0 lg:border-r">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/80">
              Civic Survival Guide
            </div>
            <h1 className="font-serif text-4xl leading-tight">Pancasila Digital Hub</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/78">
              Ruang belajar untuk siswa dan pemilih pemula menimbang refleksi, diskusi, dan etika digital lewat nilai Pancasila.
            </p>
          </div>

          <div className="space-y-3">
            {units.map((unit) => {
              const active = unit.id === selectedUnitId;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                    active
                      ? "border-[#f3d27a] bg-white text-[#8b1115]"
                      : "border-white/15 bg-white/8 text-white hover:bg-white/14"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.24em]">
                      Sila {unit.sila_number}
                    </span>
                    <RiArrowRightUpLine className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold leading-5">{unit.title}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto space-y-3 pt-8">
            <div className="rounded-[24px] border border-white/15 bg-black/15 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <RiShieldCheckLine className="h-4 w-4 text-[#f3d27a]" />
                Moderation status
              </div>
              <p className="text-sm text-white/78">
                Ethics Compiler aktif. Saat `OPENAI_API_KEY` belum diatur, aplikasi memakai filter heuristik demo.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/8 p-4 text-sm text-white/78">
              Guest mode aktif. Penyimpanan berjalan di memori server sampai Supabase dihubungkan.
            </div>
          </div>
        </aside>

        <main className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="border-b border-stone-200/70 px-5 py-6 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-8">
            <div className="mb-6 rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_30px_70px_rgba(125,32,22,0.08)] backdrop-blur">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fbe4bf] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#7b3011]">
                    Reflection Wall
                  </div>
                  <h2 className="text-2xl font-semibold">{selectedUnit?.title}</h2>
                </div>
                <span
                  className="hidden rounded-full px-3 py-1 text-xs font-semibold text-white sm:inline-flex"
                  style={{ backgroundColor: selectedUnit?.color_accent }}
                >
                  Terverifikasi AI
                </span>
              </div>

              <p className="mb-5 max-w-2xl text-sm leading-6 text-stone-600">
                {selectedUnit?.hook_question}
              </p>

              <form onSubmit={submitReflection} className="space-y-4">
                <textarea
                  value={reflectionInput}
                  onChange={(event) => setReflectionInput(event.target.value)}
                  rows={5}
                  placeholder="Tulis refleksi tentang nilai Pancasila yang paling relevan di ruang digital hari ini."
                  className={`w-full rounded-[24px] border bg-white px-4 py-4 text-sm outline-none transition ${
                    reflectionError
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-stone-200 focus:border-[#b71c1c]"
                  }`}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex items-center gap-2 text-sm text-stone-600">
                    <input
                      checked={postAnonymously}
                      onChange={(event) => setPostAnonymously(event.target.checked)}
                      type="checkbox"
                      className="h-4 w-4 rounded border-stone-300 text-[#b71c1c]"
                    />
                    Kirim sebagai Anonim
                  </label>
                  <button
                    type="submit"
                    disabled={busyState === "reflection"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b71c1c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f1313] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RiQuillPenLine className="h-4 w-4" />
                    Kirim refleksi
                  </button>
                </div>
                {reflectionError ? (
                  <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm text-red-700">
                    <RiErrorWarningLine className="h-4 w-4" />
                    {reflectionError}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="space-y-4">
              {reflections.map((reflection) => (
                <article
                  key={reflection.id}
                  className="rounded-[28px] border border-[#f0e2d5] bg-white/80 p-5 shadow-[0_14px_38px_rgba(64,35,16,0.05)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800">
                      <RiShieldCheckLine className="h-4 w-4 text-[#c79d2a]" />
                      {reflection.author_name}
                    </div>
                    <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                      {formatRelativeStamp(reflection.created_at)}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-stone-700">{reflection.content}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            <div className="mb-6 rounded-[28px] border border-[#ead7c8] bg-[#fffaf5] p-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#8b1115] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                <RiGovernmentLine className="h-4 w-4" />
                Discussion Starter
              </div>
              <p className="text-base leading-7 text-stone-700">{selectedUnit?.hook_question}</p>
            </div>

            {!isLoggedIn ? (
              <div className="mb-6 rounded-[28px] border border-[#ead7c8] bg-white/85 p-6">
                <h3 className="text-lg font-semibold">Masuk untuk berdiskusi</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Kamu bisa berbagi refleksi tanpa login. Untuk melihat, membuat diskusi, dan chat, silakan masuk dulu.
                </p>
                <a
                  href="/login"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[#b71c1c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8f1313]"
                >
                  Masuk / Daftar
                </a>
              </div>
            ) : null}

            <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Diskusi aktif</h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                    {discussions.length} thread
                  </span>
                </div>

                <div className="space-y-3">
                  {discussions.map((discussion) => {
                    const active = discussion.id === selectedDiscussion?.id;
                    return (
                      <button
                        key={discussion.id}
                        type="button"
                        onClick={() => setSelectedDiscussionId(discussion.id)}
                        className={`w-full rounded-[24px] border p-4 text-left transition ${
                          active
                            ? "border-[#b71c1c] bg-white shadow-[0_10px_25px_rgba(125,20,24,0.08)]"
                            : "border-stone-200/80 bg-white/70 hover:border-stone-300"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold">
                            <RiChat3Line className="h-4 w-4 text-[#b71c1c]" />
                            {discussion.title}
                          </span>
                          <span className="text-xs text-stone-500">
                            {formatRelativeStamp(discussion.created_at)}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-stone-600">{discussion.content}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_50px_rgba(111,49,20,0.06)]">
                <h3 className="mb-3 text-lg font-semibold">Buka thread baru</h3>
                <form onSubmit={submitDiscussion} className="space-y-3">
                  <input
                    value={discussionTitle}
                    onChange={(event) => setDiscussionTitle(event.target.value)}
                    placeholder="Judul diskusi"
                    disabled={!isLoggedIn}
                    className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b71c1c]"
                  />
                  <textarea
                    value={discussionInput}
                    onChange={(event) => setDiscussionInput(event.target.value)}
                    rows={4}
                    placeholder="Jelaskan isu atau pertanyaan yang ingin dibahas."
                    disabled={!isLoggedIn}
                    className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b71c1c]"
                  />
                  <button
                    type="submit"
                    disabled={busyState === "discussion" || !isLoggedIn}
                    className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RiArrowRightUpLine className="h-4 w-4" />
                    Buat diskusi
                  </button>
                  {discussionError ? (
                    <p className="rounded-[18px] bg-red-50 px-3 py-2 text-sm text-red-700">
                      {discussionError}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#ecd8c7] bg-[#fffdf9] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedDiscussion?.title ?? "Pilih diskusi"}</h3>
                  <p className="text-sm text-stone-600">
                    {selectedDiscussion?.content ?? "Percakapan akan muncul di sini."}
                  </p>
                </div>
                <span className="rounded-full bg-[#fbe4bf] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8d4000]">
                  Live chat
                </span>
              </div>

              <div className="mb-4 max-h-[320px] space-y-3 overflow-y-auto rounded-[24px] border border-stone-200 bg-white p-4">
                {messages.map((message) => {
                  const isMine = Boolean(message.author_id && message.author_id === currentUserId);
                  const authorLabel = isMine
                    ? currentUserName || "Kamu"
                    : message.author_name || "Peserta";

                  return (
                    <div key={message.id} className={isMine ? "ml-auto max-w-[85%]" : "max-w-[85%]"}>
                      <div
                        className={`mb-1 text-[11px] uppercase tracking-[0.16em] ${
                          isMine ? "text-stone-400 text-right" : "text-stone-500"
                        }`}
                      >
                        {authorLabel}
                      </div>
                      <div
                        className={`rounded-[20px] px-4 py-3 text-sm leading-6 ${
                          isMine
                            ? "bg-[#8b1115] text-white"
                            : "bg-[#f8e7dc] text-stone-800"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submitMessage} className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="Kirim pandangan singkat yang konstruktif."
                  disabled={!isLoggedIn}
                  className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#b71c1c]"
                />
                <button
                  type="submit"
                  disabled={busyState === "message" || !isLoggedIn}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b71c1c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f1313] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RiSendPlaneFill className="h-4 w-4" />
                  Kirim
                </button>
              </form>
              {messageError ? (
                <p className="mt-3 rounded-[18px] bg-red-50 px-3 py-2 text-sm text-red-700">
                  {messageError}
                </p>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
