import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="">
        {children}
      </main>
      <footer className="py-8 border-t border-default-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-default-600">
            © 2025 BlastType. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
