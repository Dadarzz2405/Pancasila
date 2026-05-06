# Project Blueprint: Pancasila Digital Hub 

## 1. Vision & Mission
To build a digital platform acting as a "Survival Guide" for Indonesian citizens (specifically 10th-grade students / first-time voters) to navigate the cyber world based on the values of Pancasila.

**Visual Theme:** Modern Minimalist, Red & White (National Flag), and Gold Accents (Garuda).

---

## 2. Technical Architecture (Tech Stack)
* **Frontend:** React.js / Next.js with TypeScript (for type safety and scalability).
* **Styling:** Tailwind CSS (for minimalist, responsive design).
* **Backend & Database:** Supabase (PostgreSQL) - Handles authentication, data storage, and real-time chat.
* **AI Logic:** OpenAI API or Google Gemini API (acting as the "Ethics Compiler" engine).
* **Prototyping:** UI/UX Mockup References (Figma/Stitch concepts).

---

## 3. Database Schema (Supabase / PostgreSQL)

### Table: `units`
Stores data for the 5 main learning units.
* `id`: uuid (primary key)
* `title`: string (e.g., "Toleransi & Keberagaman" / Tolerance & Diversity)
* `hook_question`: text (Static discussion trigger)
* `color_accent`: string (Hex code)

### Table: `reflections` (Reflection Wall)
* `id`: uuid
* `unit_id`: uuid (foreign key to `units`)
* `content`: text
* `is_anonymous`: boolean
* `author_name`: string (default "Anonim")
* `status`: enum ('verified', 'rejected', 'pending')
* `ai_feedback`: text (reason if rejected)
* `created_at`: timestamp

### Table: `discussions` (User-Generated Threads)
* `id`: uuid
* `unit_id`: uuid
* `title`: string
* `content`: text
* `author_id`: uuid
* `created_at`: timestamp

### Table: `messages` (Chat Room)
* `id`: uuid
* `discussion_id`: uuid
* `author_id`: uuid
* `content`: text
* `created_at`: timestamp

---

## 4. Core Logic: The Ethics Compiler (AI Moderation)

This is the logic workflow used to filter every user input (Reflections & Discussions).

### Filtering Criteria:
1. **Benar (Truthful):** Does not contain hoaxes or disinformation.
2. **Baik (Ethical):** Does not contain hate speech, cyberbullying, or discrimination (SARA).
3. **Penting (Relevant):** Adds constructive value to the topic of Pancasila and civic life.

### Workflow:
1. User submits text input.
2. Frontend sends the text to the API Route `/api/moderate`.
3. AI analyzes the prompt:
   > "Act as a Pancasila Moderator. Analyze the following text based on Truthful, Ethical, and Relevant criteria. If it violates these rules, provide a short, constructive reason. Respond in JSON: { 'valid': boolean, 'reason': string }"
4. If `valid: true`, the data is saved to the database.
5. If `valid: false`, return an error to the UI (Red border on input & show AI feedback).

---

## 5. User Interface (UI) Structure

### 3-Column Layout (Responsive):
1. **Left Column (Navigation Sidebar):**
   * Pancasila Hub Logo.
   * Menu for the 5 Units (Dynamic navigation).
   * Connection / Auth status.

2. **Middle Column (Reflection Wall):**
   * Input Card: Textarea + Anonymous Toggle + Crimson Red "Kirim" (Submit) button.
   * List Cards: Display of AI-verified reflections (includes the Gold Shield icon).

3. **Right Column (Discussion/Chat):**
   * Pinned Box: Static Hook Question from the system.
   * Discussion List: Thread titles created by other users.
   * Chat Interface: Real-time chat room for the selected topic.

---

## 6. Development Roadmap

### Phase 1: Setup & UI (Week 1)
* Initialize Next.js + Tailwind project.
* Build the static 3-column UI based on the design concepts.
* Set up the color theme: Red (`#D32F2F`), White (`#FFFFFF`), and Gold (`#D4AF37`).

### Phase 2: Database & Auth (Week 2)
* Configure Supabase.
* Implement Anonymous Login or Google Auth.
* Connect the UI inputs with the database (Create & Read operations).

### Phase 3: Ethics Compiler AI Integration (Week 3)
* Build the API Route for text moderation using AI.
* Implement visual error feedback if text is rejected (Red borders & AI tooltips).

### Phase 4: Real-time & Optimization (Week 4)
* Enable Supabase Real-time for the Chat Room.
* Testing, bug fixing, and responsiveness checks.
* Deployment to Vercel or Netlify.

---

## 7. Closing Note (Reflection)
This project serves as proof that Pancasila is not just a theoretical concept to be memorized, but a logical framework that can be integrated into modern algorithms to create a more civilized and ethical digital society.
