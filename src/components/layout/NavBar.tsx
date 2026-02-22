export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 bg-[#f4f5f2]/90 backdrop-blur-lg border-b border-[rgba(18,20,18,0.12)] dark:bg-[#0d0f0e]/90 dark:border-white/10">
      <div className="max-w-290 w-[92vw] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4.5 max-lg:justify-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-12 rounded-2xl grid place-items-center shadow-[0_10px_24px_rgba(15,107,79,0.25)]"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(42,166,127,0.4), transparent 70%), #0f1411",
              }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 64 64" role="img" aria-label="UniMarket logo">
                <defs>
                  <linearGradient id="umLeaf" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2aa67f" />
                    <stop offset="100%" stopColor="#0f6b4f" />
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill="#0f1411" />
                <path
                  d="M19 36c0-9 6-16 13-18 6-2 13 2 13 10 0 10-8 18-20 18-4 0-6-3-6-10Z"
                  fill="url(#umLeaf)"
                />
                <path
                  d="M26 40c6-3 12-9 14-16"
                  stroke="#f4f2ee"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <div className="font-bold text-lg">UniMarket Rwanda</div>
              <div className="text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                UniMarket Rwanda — for students, by students.
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-4" aria-label="Primary">
            <a
              href="#categories"
              className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] bg-transparent border-none cursor-pointer text-sm"
            >
              Categories
            </a>
            <a
              href="#featured"
              className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] bg-transparent border-none cursor-pointer text-sm"
            >
              Featured
            </a>
            <a
              href="#deals"
              className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] bg-transparent border-none cursor-pointer text-sm"
            >
              Deals
            </a>
            <a
              href="#support"
              className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] bg-transparent border-none cursor-pointer text-sm"
            >
              Support
            </a>
          </nav>

          {/* Actions */}
          <div className="flex gap-2.5 max-sm:w-full max-sm:justify-center">
            <button
              className="bg-transparent text-[#5f5b52] dark:text-[#b7b1a6] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm cursor-pointer transition-transform duration-200 hover:-translate-y-px"
              type="button"
            >
              Sign in
            </button>

            <button
              className="bg-transparent text-[#5f5b52] dark:text-[#b7b1a6] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm cursor-pointer transition-transform duration-200 hover:-translate-y-px"
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
