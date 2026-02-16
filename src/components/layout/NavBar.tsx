export default function Navbar() {
  return (
    <header className="topbar">
      <div className="flex justify-between py-4 px-12 items-center">
        <div className="brand flex items-center gap-3">
          <div className="">
            <span className="brand-mark" aria-hidden="true">
              <svg
                className="w-15 h-15"
                viewBox="0 0 64 64"
                role="img"
                aria-label="UniMarket logo"
              >
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
          </div>
          <div className="">
            <div className="brand-name text-lg font-bold">UniMarket Rwanda</div>
            <div className="brand-tag text-sm">
              UniMarket Rwanda — for students, by students.
            </div>
          </div>
        </div>
        <nav className="gap-3" aria-label="Primary">
          <a className="nav-link" href="#categories">
            Categories
          </a>
          <a className="nav-link" href="#featured">
            Featured
          </a>
          <a className="nav-link" href="#deals">
            Deals
          </a>
          <a className="nav-link" href="#support">
            Support
          </a>
        </nav>
        <div className="topbar-actions">
          <button className="ghost-button" type="button">
            Sign in
          </button>
          {/*{authUser && (
            <button
              className="ghost-button"
              type="button"
            >
              Sign out
            </button>
          )}*/}
          <div>
            <a href="">Sign up</a>
          </div>
        </div>
      </div>
    </header>
  );
}
