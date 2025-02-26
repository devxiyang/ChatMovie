import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Home() {
  return (
    <main className="flex flex-col gap-6 px-4">
      <h1 className="text-3xl font-bold">Welcome to Chat Movie</h1>
      <p className="text-lg">Your place for all things movies and chat.</p>
    </main>
  );
}
