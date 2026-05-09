import { AuthForm } from "@/app/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6db_0%,#fff9f1_22%,#f7f0ea_46%,#f5efec_100%)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 w-full max-w-xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center rounded-full bg-[#9d1418] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white">
            Civic Survival Guide
          </div>
          <h1 className="font-serif text-5xl leading-tight text-stone-900">Pancasila Digital Hub</h1>
          <p className="mt-4 text-base leading-7 text-stone-600">
            Masuk untuk berbagi refleksi, berdiskusi, dan ikut menjaga etika digital berbasis nilai Pancasila.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <AuthForm redirectTo="/" />
        </div>
      </div>
    </div>
  );
}

