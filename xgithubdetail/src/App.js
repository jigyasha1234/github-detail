import { useState } from "react";

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Segoe UI", system-ui, -apple-system, Arial, sans-serif; background: #f5f7fb; color: #1f2937; }
  .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { width: 100%; max-width: 500px; background: #fff; border-radius: 12px; padding: 22px 24px; box-shadow: 0 6px 24px rgba(15, 23, 42, 0.1); }
  .title { margin: 0; text-align: center; font-size: 26px; font-weight: 800; color: #111827; }
  .subtitle { margin: 2px 0 14px; text-align: center; font-size: 11px; color: #6b7280; }
  .search-row { display: flex; gap: 8px; }
  .search-input { flex: 1; min-width: 0; padding: 8px 10px; font-size: 12px; color: #fff; background: #3a3a3a; border: 1px solid #3a3a3a; border-radius: 6px; outline: none; }
  .search-input::placeholder { color: #9ca3af; }
  .search-input:focus { border-color: #2563eb; }
  .search-btn { padding: 8px 14px; font-size: 11px; font-weight: 700; color: #fff; background: #2563eb; border: 0; border-radius: 6px; cursor: pointer; }
  .search-btn:hover { background: #1d4ed8; }
  .search-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .message { margin-top: 14px; text-align: center; font-size: 11px; color: #6b7280; }
  .message.error { padding: 10px; font-size: 11px; color: #7f1d1d; background: #fee2e2; border-radius: 8px; }
  .profile { display: flex; align-items: center; gap: 14px; margin-top: 14px; }
  .avatar { width: 80px; height: 80px; border-radius: 50%; background: #e0e7ff; flex-shrink: 0; object-fit: cover; }
  .name-row { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
  .name { margin: 0; font-size: 18px; font-weight: 800; color: #111827; }
  .login { font-size: 10px; color: #6b7280; }
  .stats { display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap; }
  .stat { padding: 4px 8px; font-size: 10px; color: #6b7280; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; }
  .stat strong { margin-right: 4px; color: #111827; }
  .meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: 10px; color: #374151; }
  .meta a { color: #1d4ed8; }
`;

export default function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = username.trim();

    if (!u) {
      setUser(null);
      setError("Please enter a GitHub username.");
      return;
    }

    setLoading(true);
    setError("");
    setUser(null);

    try {
      const res = await fetch(`https://api.github.com/users/${u}`);
      const data = await res.json();

      if (data && data.login) {
        setUser(data);
      } else if (data && data.message === "Not Found") {
        setError("User not found.");
      } else {
        // e.g. rate limit exceeded (403) – show GitHub's own message
        setError((data && data.message) || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="card">
          <h1 className="title">GitHub User Finder</h1>
          <p className="subtitle">Search a GitHub username to see profile details.</p>

          <form className="search-row" onSubmit={handleSubmit}>
            <input
              className="search-input"
              type="text"
              name="username"
              placeholder="e.g. torvalds, gaearon, octocat"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button className="search-btn" type="submit" disabled={loading}>
              Search
            </button>
          </form>

          {loading && <div className="message">Loading...</div>}

          {error && !loading && <div className="message error">{error}</div>}

          {!user && !error && !loading && (
            <div className="message">
              No user yet. Try searching for "octocat".
            </div>
          )}

          {user && !loading && (
            <div className="profile">
              <img className="avatar" src={user.avatar_url} alt={user.login} />
              <div>
                <div className="name-row">
                  <h2 className="name">{user.name || user.login}</h2>
                  <span className="login">@{user.login}</span>
                </div>

                <div className="stats">
                  <span className="stat"><strong>{user.public_repos}</strong>Repos</span>
                  <span className="stat"><strong>{user.followers}</strong>Followers</span>
                  <span className="stat"><strong>{user.following}</strong>Following</span>
                </div>

                <div className="meta">
                  {user.location && <span>📍 {user.location}</span>}
                  {user.company && <span>🏢 {user.company}</span>}
                  {user.blog && (
                    <span>
                      🔗{" "}
                      <a
                        href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {user.blog}
                      </a>
                    </span>
                  )}
                  <span>
                    🐙{" "}
                    <a href={user.html_url} target="_blank" rel="noreferrer">
                      View on GitHub
                    </a>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
