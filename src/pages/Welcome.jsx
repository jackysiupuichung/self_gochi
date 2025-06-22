// src/pages/Welcome.jsx
import { Link } from "react-router-dom";

export default function Welcome() {
    return (
        <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-5xl font-bold text-indigo-700 mb-4">Welcome to Self-Gochi!</h1>
            <p className="text-gray-700 text-lg max-w-xl mb-8">
                Your calendar-driven digital twin is here. Manage your time, emotions, and social interactions – all powered by your personal agent.
            </p>

            <div className="flex gap-4">
                <Link to="/login">
                    <button className="bg-indigo-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-indigo-600 transition">
                        Login
                    </button>
                </Link>

                <Link to="/register">
                    <button className="bg-white border border-indigo-500 text-indigo-600 font-semibold px-6 py-2 rounded-full hover:bg-indigo-50 transition">
                        Register
                    </button>
                </Link>
            </div>
        </div>
    );
}
