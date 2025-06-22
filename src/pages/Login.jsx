// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username || !password) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);
        setError("");

        fetch(`http://localhost:3001/users?username=${username}&password=${password}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    localStorage.setItem("user", JSON.stringify({ id: data[0].id, name: data[0].username }));
                    navigate("/dashboard");
                } else {
                    setError("Invalid username or password.");
                }
            })
            .catch((err) => {
                console.error("Login error", err);
                setError("Server error. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center px-4">
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">Login to Dashboard</h2>
            <div className="text-6xl mb-4 animate-bounce">🩷</div>

            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                <label className="block text-gray-700 text-sm font-semibold mb-1">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

                <button
                    onClick={handleLogin}
                    disabled={loading || !username || !password}
                    className={`w-full font-semibold py-2 rounded-md transition ${
                        loading || !username || !password
                            ? "bg-indigo-300 text-white cursor-not-allowed"
                            : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
}
