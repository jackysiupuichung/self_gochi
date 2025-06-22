// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    if (username && password) {
      // 1. 查询用户名是否已存在
      fetch(`http://localhost:3001/users?username=${username}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.length > 0) {
              setError("Username already exists. Please choose another.");
            } else {
              // 2. 不存在则注册用户
              fetch("http://localhost:3001/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
              })
                  .then((res) => res.json())
                  .then((newUser) => {
                    localStorage.setItem(
                        "user",
                        JSON.stringify({ id: newUser.id, name: newUser.username }),
                    );
                    navigate("/dashboard");
                  })
                  .catch((err) => {
                    console.error("Registration failed", err);
                    setError("Registration failed. Please try again.");
                  });
            }
          })
          .catch((err) => {
            console.error("Error checking username", err);
            setError("Error checking username. Please try again.");
          });
    } else {
      setError("Please enter both username and password.");
    }
  };

  return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center px-4">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">Create a FinchVerse Account</h2>
        <div className="text-6xl mb-4">🐤</div>

        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <label className="block text-gray-700 text-sm font-semibold mb-1">Username</label>
          <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mb-3"
          />

          <label className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
          <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mb-4"
          />

          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

          <button
              onClick={handleRegister}
              className="w-full bg-indigo-500 text-white font-semibold py-2 rounded-md hover:bg-indigo-600 transition"
          >
            Register
          </button>
        </div>
      </div>
  );
}
