import Navigation from "@/components/Navigation";
import BackButton from "@/components/BackButton";
import TeamWorkspace from "@/components/TeamWorkspace";

export default function Teams() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton />
          <TeamWorkspace />
        </div>
      </main>
    </div>
  );
}