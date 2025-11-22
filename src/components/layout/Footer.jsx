// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Travel App. All rights reserved.</p>

        <div className="flex items-center gap-4">
          <button type="button" className="hover:text-slate-700 transition">
            Terms
          </button>
          <button type="button" className="hover:text-slate-700 transition">
            Privacy
          </button>
        </div>
      </div>
    </footer>
  );
}
