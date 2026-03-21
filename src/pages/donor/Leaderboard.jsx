import { useEffect, useState } from "react";
import { Medal, Sparkles, Trophy } from "lucide-react";
import api from "../../services/api";

const podiumTint = {
    1: "bg-[#E8F5E9] border-green-100",
    2: "bg-[#EEF7EE] border-green-100",
    3: "bg-[#E3F1E4] border-green-100"
};

function Leaderboard() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const currentUserId = Number(localStorage.getItem("userid"));

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get("/gamification/leaderboard", {
                    params: { limit: 25 }
                });
                setEntries(response.data || []);
            } catch (err) {
                setError("Unable to load leaderboard right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const topThree = entries.slice(0, 3);
    const remaining = entries.slice(3);

    return (
        <div className="min-h-screen bg-[#FFF8F0] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <section className="overflow-hidden rounded-[32px] border border-green-100 bg-[#E8F5E9] px-6 py-8 shadow-[0_20px_50px_-30px_rgba(46,125,50,0.25)] sm:px-10">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2E7D32]">Community leaderboard</p>
                            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Who is moving Sevana forward.</h1>
                            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                                Rankings are based on confirmed donations, completed deliveries, and contribution streaks.
                            </p>
                        </div>
                        <div className="rounded-full border border-green-100 bg-white px-5 py-3 text-sm font-semibold text-[#2E7D32] shadow-sm">
                            Updated from live platform activity
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="py-20 text-center text-slate-500">Loading leaderboard...</div>
                ) : error ? (
                    <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">{error}</div>
                ) : entries.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-10 text-center text-slate-600">
                        No confirmed donor activity yet.
                    </div>
                ) : (
                    <>
                        <section className="mt-8 grid gap-5 lg:grid-cols-3">
                            {topThree.map((entry) => (
                                <article
                                    key={entry.donorId}
                                    className={`rounded-[28px] border p-6 shadow-[0_20px_45px_-34px_rgba(46,125,50,0.22)] ${podiumTint[entry.rank] || "bg-white border-green-100"} ${entry.donorId === currentUserId ? "ring-2 ring-[#2E7D32]" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32] px-4 py-2 text-sm font-semibold text-white">
                                            <Trophy className="h-4 w-4" />
                                            Rank #{entry.rank}
                                        </div>
                                        <Medal className="h-8 w-8 text-[#2E7D32]" />
                                    </div>
                                    <h2 className="mt-6 text-2xl font-semibold text-slate-900">{entry.username}</h2>
                                    <p className="mt-2 text-sm text-slate-500">{entry.donorId === currentUserId ? "You are here" : "Top donor on the platform"}</p>

                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-white/80 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Impact score</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900">{entry.impactScore}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/80 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Badges</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900">{entry.badgesUnlocked}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/80 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Confirmed</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900">{entry.totalConfirmedDonations}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/80 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Streak</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900">{entry.currentStreak} mo</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <section className="mt-8 overflow-hidden rounded-[28px] border border-green-100 bg-white shadow-[0_20px_50px_-35px_rgba(46,125,50,0.22)]">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Full rankings</h2>
                                    <p className="text-sm text-slate-500">Top 25 donors across the platform</p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-semibold text-[#2E7D32]">
                                    <Sparkles className="h-4 w-4" />
                                    Public inside Sevana
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-[#f7fbf5] text-left text-xs uppercase tracking-[0.22em] text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Rank</th>
                                            <th className="px-6 py-4">Donor</th>
                                            <th className="px-6 py-4">Impact score</th>
                                            <th className="px-6 py-4">Confirmed</th>
                                            <th className="px-6 py-4">Delivered</th>
                                            <th className="px-6 py-4">Current streak</th>
                                            <th className="px-6 py-4">Longest streak</th>
                                            <th className="px-6 py-4">Badges</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                        {[...topThree, ...remaining].map((entry) => (
                                            <tr key={entry.donorId} className={entry.donorId === currentUserId ? "bg-[#F1F8E9]" : "bg-white"}>
                                                <td className="px-6 py-4 font-semibold text-slate-900">#{entry.rank}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">{entry.username}</td>
                                                <td className="px-6 py-4">{entry.impactScore}</td>
                                                <td className="px-6 py-4">{entry.totalConfirmedDonations}</td>
                                                <td className="px-6 py-4">{entry.deliveredDonations}</td>
                                                <td className="px-6 py-4">{entry.currentStreak} months</td>
                                                <td className="px-6 py-4">{entry.longestStreak} months</td>
                                                <td className="px-6 py-4">{entry.badgesUnlocked}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
