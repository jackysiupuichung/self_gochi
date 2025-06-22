import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const gochiMessages = [
    "Gochi says: Don't forget to breathe 🌬️",
    "A short walk boosts energy! 🚶‍♀️",
    "Stay focused, Trainer 💪",
    "Schedule looking packed... ready?",
    "You’re doing great – I’m proud of you! 🐣",
];

const mockTodayEvents = [
    { time: "09:00", title: "Deep Work Session" },
    { time: "13:00", title: "Lunch with Teammate" },
    { time: "16:00", title: "Project Sync Meeting" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) {
            navigate("/login");
        } else {
            setUser(JSON.parse(stored));
            setMessage(gochiMessages[Math.floor(Math.random() * gochiMessages.length)]);
        }

        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 to-white px-6 py-10 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-indigo-700 mb-2">
                Hello, {user?.name || "Gochi Guardian"}!
            </h1>

            <div className="text-gray-600 mb-4">
                Current Time: {now.toLocaleTimeString()}
            </div>

            <div className="text-7xl mb-4 animate-wiggle-slow">🐣</div>
            <p className="text-md italic text-indigo-600 mb-6 text-center max-w-md">
                {message}
            </p>

            {/* 今日日程 */}
            <div className="bg-white rounded-lg shadow-md w-full max-w-md p-5 mb-6">
                <h2 className="text-lg font-semibold text-indigo-700 mb-3">📅 Your Schedule Today</h2>
                <ul className="space-y-2">
                    {mockTodayEvents.map((event, index) => (
                        <li
                            key={index}
                            className="flex justify-between text-sm text-gray-700 border-b border-gray-100 pb-1"
                        >
                            <span className="font-mono text-indigo-500">{event.time}</span>
                            <span>{event.title}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 登出按钮 */}
            <button
                onClick={handleLogout}
                className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-full transition"
            >
                Logout
            </button>
        </div>
    );
}
