import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [agent, setAgent] = useState(null);
    const [profile, setProfile] = useState(null);
    const [now, setNow] = useState(new Date());
    const [forecast, setForecast] = useState(null);

    const [showEditor, setShowEditor] = useState(false);
    const [form, setForm] = useState({ name: "", personality: "", region: "North" });

    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [profileForm, setProfileForm] = useState({
        sleepPattern: "early bird",
        dietPreference: "balanced",
        activityLevel: "moderate",
        socialStyle: "introvert",
        workloadFeeling: "balanced",
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return navigate("/login");

        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        fetch(`http://localhost:3002/agents?userId=${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setAgent(data[0]);
                    setForm({
                        name: data[0].characterName,
                        personality: data[0].personality,
                        region: data[0].region,
                    });
                }
            });

        fetch(`http://localhost:3003/profiles?userId=${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setProfile(data[0]);
                    setProfileForm({
                        sleepPattern: data[0].sleepPattern,
                        dietPreference: data[0].dietPreference,
                        activityLevel: data[0].activityLevel,
                        socialStyle: data[0].socialStyle,
                        workloadFeeling: data[0].workloadFeeling,
                    });
                }
            });

        fetch(`http://localhost:3004/weather`)
            .then((res) => res.json())
            .then((data) => setForecast(data.properties?.periods?.slice(0, 3)))
            .catch(console.error);

        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSave = () => {
        if (!agent) return;
        fetch(`http://localhost:3002/agents/${agent.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                characterName: form.name,
                personality: form.personality,
                region: form.region,
            }),
        })
            .then(() => {
                setAgent({ ...agent, ...form });
                setShowEditor(false);
            })
            .catch(() => alert("Failed to save changes."));
    };

    const handleProfileSave = () => {
        if (!profile) return;
        fetch(`http://localhost:3003/profiles/${profile.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileForm),
        })
            .then(() => {
                setProfile({ ...profile, ...profileForm });
                setShowProfileEditor(false);
            })
            .catch(() => alert("Failed to save profile."));
    };

    return (
        <div className="min-h-screen bg-sky-50 px-6 py-10 flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-1">
                    Hello, {user?.name || "Trainer"}!
                </h1>
                <p className="text-sm text-gray-600 mb-6">Current Time: {now.toLocaleTimeString()}</p>

                {agent && (
                    <div className="bg-white p-5 rounded-md shadow-md w-full max-w-md mb-6 text-sm">
                        <h2 className="text-lg font-semibold text-indigo-700 mb-3">🐣 Your Self-Gochi</h2>
                        <p><strong>Name:</strong> {agent.characterName}</p>
                        <p><strong>Personality:</strong> {agent.personality}</p>
                        <p><strong>Region:</strong> {agent.region}</p>
                        <div className="mt-2">
                            <p><strong>Sleep Quality:</strong> {agent.sleepQuality}</p>
                            <p><strong>Diet Score:</strong> {agent.dietScore}</p>
                            <p><strong>Activity Score:</strong> {agent.activityScore}</p>
                            {/*<p><strong>Calendar Balance:</strong> {agent.calendarBalance}</p>*/}
                        </div>
                        <button
                            onClick={() => setShowEditor(true)}
                            className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                        >
                            Customize Gochi
                        </button>
                    </div>
                )}

                {profile && (
                    <div className="bg-white p-5 rounded-md shadow-md w-full max-w-md mb-6 text-sm">
                        <h2 className="text-lg font-semibold text-yellow-700 mb-3">🧠 Your Preferences</h2>
                        <p><strong>Sleep Pattern:</strong> {profile.sleepPattern}</p>
                        <p><strong>Diet:</strong> {profile.dietPreference}</p>
                        <p><strong>Activity Level:</strong> {profile.activityLevel}</p>
                        <p><strong>Social Style:</strong> {profile.socialStyle}</p>
                        <p><strong>Workload Feeling:</strong> {profile.workloadFeeling}</p>
                        <button
                            onClick={() => setShowProfileEditor(true)}
                            className="mt-4 bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                        >
                            Define Myself
                        </button>
                    </div>
                )}

                {forecast && (
                    <div className="bg-white p-5 rounded-md shadow-md w-full max-w-md text-sm">
                        <h2 className="text-lg font-semibold text-blue-700 mb-3">☀️ Boston Weather Forecast</h2>
                        {forecast.map((period) => (
                            <div key={period.number} className="mb-3">
                                <p><strong>{period.name}</strong>: {period.shortForecast}</p>
                                <p>🌡 {period.temperature}°{period.temperatureUnit}, 💧 {period.probabilityOfPrecipitation?.value ?? 0}%</p>
                                <p>💨 {period.windDirection} {period.windSpeed}</p>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="bg-red-400 text-white px-6 py-2 mt-6 rounded-full hover:bg-red-500"
                >
                    Logout
                </button>
            </div>

            {/* Editors */}
            {showEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold text-indigo-700 mb-4">Edit Your Gochi</h2>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <label className="block text-sm text-gray-600 mb-1">Personality</label>
                        <textarea
                            value={form.personality}
                            onChange={(e) => setForm({ ...form, personality: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                            rows={2}
                        />
                        <label className="block text-sm text-gray-600 mb-1">Region</label>
                        <select
                            value={form.region}
                            onChange={(e) => setForm({ ...form, region: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        >
                            <option>North</option>
                            <option>South</option>
                            <option>East</option>
                            <option>West</option>
                        </select>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowEditor(false)} className="text-gray-500 hover:underline">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showProfileEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold text-yellow-600 mb-4">Define Yourself</h2>
                        <label className="block text-sm mb-1">Sleep Pattern</label>
                        <input
                            type="text"
                            value={profileForm.sleepPattern}
                            onChange={(e) => setProfileForm({ ...profileForm, sleepPattern: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <label className="block text-sm mb-1">Diet Preference</label>
                        <input
                            type="text"
                            value={profileForm.dietPreference}
                            onChange={(e) => setProfileForm({ ...profileForm, dietPreference: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <label className="block text-sm mb-1">Activity Level</label>
                        <input
                            type="text"
                            value={profileForm.activityLevel}
                            onChange={(e) => setProfileForm({ ...profileForm, activityLevel: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <label className="block text-sm mb-1">Social Style</label>
                        <input
                            type="text"
                            value={profileForm.socialStyle}
                            onChange={(e) => setProfileForm({ ...profileForm, socialStyle: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <label className="block text-sm mb-1">Workload Feeling</label>
                        <input
                            type="text"
                            value={profileForm.workloadFeeling}
                            onChange={(e) => setProfileForm({ ...profileForm, workloadFeeling: e.target.value })}
                            className="w-full mb-3 px-3 py-2 border rounded"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowProfileEditor(false)} className="text-gray-500 hover:underline">
                                Cancel
                            </button>
                            <button
                                onClick={handleProfileSave}
                                className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
