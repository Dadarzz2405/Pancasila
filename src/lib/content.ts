import type { Discussion, Message, Reflection, Unit } from "@/src/lib/types";

export const units: Unit[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    sila_number: 1,
    title: "Ketuhanan Yang Maha Esa",
    hook_question: "Bagaimana kamu menjaga toleransi beragama di dunia digital?",
    color_accent: "#D32F2F",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    sila_number: 2,
    title: "Kemanusiaan yang Adil dan Beradab",
    hook_question: "Pernahkah kamu menyaksikan cyberbullying? Apa yang kamu lakukan?",
    color_accent: "#C62828",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    sila_number: 3,
    title: "Persatuan Indonesia",
    hook_question: "Konten seperti apa yang menurutmu memperkuat persatuan bangsa?",
    color_accent: "#B71C1C",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    sila_number: 4,
    title: "Kerakyatan dan Musyawarah",
    hook_question: "Bagaimana cara berdemokrasi yang sehat di media sosial?",
    color_accent: "#D4AF37",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    sila_number: 5,
    title: "Keadilan Sosial",
    hook_question: "Apakah akses internet yang tidak merata adalah masalah keadilan sosial?",
    color_accent: "#8B7536",
  },
];

export const seedReflections: Reflection[] = [
  {
    id: "reflection-1",
    unit_id: "33333333-3333-3333-3333-333333333333",
    author_id: null,
    content:
      "Persatuan di internet dimulai dari kebiasaan memeriksa fakta sebelum ikut menyebarkan unggahan yang memancing emosi.",
    is_anonymous: true,
    author_name: "Anonim",
    status: "verified",
    ai_feedback: null,
    created_at: new Date("2026-05-07T09:30:00+07:00").toISOString(),
  },
  {
    id: "reflection-2",
    unit_id: "22222222-2222-2222-2222-222222222222",
    author_id: null,
    content:
      "Kalau melihat teman dibully di grup kelas, diam saja itu ikut membiarkan. Nilai kemanusiaan justru mendorong kita untuk membela dengan sopan.",
    is_anonymous: true,
    author_name: "Anonim",
    status: "verified",
    ai_feedback: null,
    created_at: new Date("2026-05-07T08:10:00+07:00").toISOString(),
  },
];

export const seedDiscussions: Discussion[] = [
  {
    id: "discussion-1",
    unit_id: "33333333-3333-3333-3333-333333333333",
    author_id: null,
    title: "Melawan Hoaks tanpa Ikut Menyerang",
    content:
      "Strategi apa yang paling efektif untuk meluruskan informasi palsu tanpa mempermalukan orang lain?",
    status: "verified",
    ai_feedback: null,
    created_at: new Date("2026-05-07T08:00:00+07:00").toISOString(),
  },
  {
    id: "discussion-2",
    unit_id: "44444444-4444-4444-4444-444444444444",
    author_id: null,
    title: "Debat Politik yang Tetap Beradab",
    content:
      "Bagaimana cara berbeda pendapat soal isu publik tanpa berubah menjadi serangan personal?",
    status: "verified",
    ai_feedback: null,
    created_at: new Date("2026-05-07T07:40:00+07:00").toISOString(),
  },
];

export const seedMessages: Message[] = [
  {
    id: "message-1",
    discussion_id: "discussion-1",
    author_id: null,
    content: "Menurutku, mulai dari kirim sumber resmi dulu sebelum menyanggah.",
    created_at: new Date("2026-05-07T09:00:00+07:00").toISOString(),
  },
  {
    id: "message-2",
    discussion_id: "discussion-1",
    author_id: null,
    content: "Setuju. Nada bicara penting supaya koreksi tidak terdengar merendahkan.",
    created_at: new Date("2026-05-07T09:05:00+07:00").toISOString(),
  },
];
