import { Award, CalendarRange, Flame, HeartHandshake, Sparkles, Trophy } from "lucide-react";

const badgeAccent = {
    FIRST_DONATION: "bg-[#EEF7EE] text-[#1B5E20] border-green-100",
    HELPING_HAND: "bg-[#E8F5E9] text-[#1B5E20] border-green-100",
    STREAK_KEEPER: "bg-[#F1F8F1] text-[#1B5E20] border-green-100",
    COMMUNITY_HERO: "bg-[#E3F1E4] text-[#1B5E20] border-green-100"
};

const badgeIcon = {
    FIRST_DONATION: Sparkles,
    HELPING_HAND: HeartHandshake,
    STREAK_KEEPER: Flame,
    COMMUNITY_HERO: Award
};

const formatDate = (value) => {
    if (!value) return null;
    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

function DonorProgressCard({ stats, compact = false }) {
    if (!stats) {
        return null;
    }

    const unlockedBadges = stats.badges?.filter((badge) => badge.unlocked) || [];
    const badgesToDisplay = compact && unlockedBadges.length > 0 ? unlockedBadges : stats.badges || [];
    const statTiles = [
        {
            label: "Impact score",
            value: stats.impactScore,
            icon: Trophy,
            tint: "bg-[#E8F5E9] text-[#2E7D32]"
        },
        {
            label: "Confirmed donations",
            value: stats.totalConfirmedDonations,
            icon: HeartHandshake,
            tint: "bg-emerald-50 text-emerald-700"
        },
        {
            label: "Current streak",
            value: `${stats.currentStreak} ${stats.streakUnit?.toLowerCase() || "months"}`,
            icon: Flame,
            tint: "bg-[#E8F5E9] text-[#2E7D32]"
        },
        {
            label: "Longest streak",
            value: `${stats.longestStreak} ${stats.streakUnit?.toLowerCase() || "months"}`,
            icon: CalendarRange,
            tint: "bg-[#EDF7EE] text-[#2E7D32]"
        }
    ];

    return (
        <section className={`overflow-hidden rounded-[28px] border border-green-100 bg-white shadow-[0_18px_45px_-28px_rgba(46,125,50,0.25)] ${compact ? "" : "mb-8"}`}>
            <div className="bg-[#E8F5E9] px-6 py-6 sm:px-8">
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#2E7D32]">Donor momentum</p>
                        <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Your giving streak is visible now.</h2>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                            Confirmed donations raise your impact score, unlock badges, and move you up the community leaderboard.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {statTiles.map(({ label, value, icon: Icon, tint }) => (
                            <div key={label} className="rounded-2xl border border-green-100 bg-white/90 p-4 shadow-sm">
                                <div className={`mb-3 inline-flex rounded-full p-2 ${tint}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Unlocked badges</h3>
                            <p className="text-sm text-slate-500">{stats.badgesUnlocked} earned so far</p>
                        </div>
                        <div className="rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-semibold text-[#2E7D32]">
                            Delivered {stats.deliveredDonations}
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {badgesToDisplay.map((badge) => {
                            const Icon = badgeIcon[badge.key] || Award;
                            const accent = badgeAccent[badge.key] || "bg-slate-50 text-slate-900 border-slate-200";

                            return (
                                <article
                                    key={badge.key}
                                    className={`rounded-2xl border p-4 transition-transform duration-300 ${accent} ${badge.unlocked ? "opacity-100" : "opacity-45 grayscale"}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em]">{badge.name}</p>
                                            <p className="mt-2 text-sm leading-6">{badge.description}</p>
                                        </div>
                                        <div className="rounded-full bg-white/60 p-2 shadow-sm">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em]">
                                        {badge.unlocked && badge.awardedAt ? `Awarded ${formatDate(badge.awardedAt)}` : "Locked"}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#f7f8f6] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Progress snapshot</p>
                    <div className="mt-4 space-y-4 text-sm text-slate-600">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-slate-500">Last confirmed contribution</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{formatDate(stats.lastContributionDate) || "No confirmed donations yet"}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-slate-500">What improves your rank</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">More confirmed donations, more deliveries, longer streaks</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-slate-500">Next milestone</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                {stats.totalConfirmedDonations < 5
                                    ? `${5 - stats.totalConfirmedDonations} more donation${5 - stats.totalConfirmedDonations === 1 ? "" : "s"} for Helping Hand`
                                    : stats.totalConfirmedDonations < 10
                                        ? `${10 - stats.totalConfirmedDonations} more donation${10 - stats.totalConfirmedDonations === 1 ? "" : "s"} for Community Hero`
                                        : "All current milestones unlocked"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DonorProgressCard;
