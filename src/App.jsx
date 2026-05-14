import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from "recharts";
import GeoMap from "./GeoMap";

const byCountry = [
  { country: "USA 🇺🇸", count: 4184 },
  { country: "UK 🇬🇧", count: 515 },
  { country: "Germany 🇩🇪", count: 514 },
  { country: "China 🇨🇳", count: 368 },
  { country: "France 🇫🇷", count: 344 },
  { country: "Canada 🇨🇦", count: 336 },
  { country: "Australia 🇦🇺", count: 290 },
  { country: "Netherlands 🇳🇱", count: 210 },
];

const byRegion = [
  { region: "North America", count: 5767, pct: 48 },
  { region: "Europe", count: 3362, pct: 28 },
  { region: "Asia-Pacific", count: 1818, pct: 15 },
  { region: "South America", count: 654, pct: 5 },
  { region: "Oceania", count: 401, pct: 3 },
  { region: "MEA", count: 120, pct: 1 },
];

const byType = [
  { name: "Colocation", value: 4029, color: "#6366f1" },
  { name: "Hyperscale", value: 3207, color: "#8b5cf6" },
  { name: "Neocloud", value: 890, color: "#a78bfa" },
  { name: "Gov/Sovereign", value: 695, color: "#c4b5fd" },
];

const growthData = [
  { year: "2020", count: 7200 },
  { year: "2022", count: 8900 },
  { year: "2023", count: 9800 },
  { year: "2024", count: 10800 },
  { year: "2025", count: 11038 },
  { year: "2026E", count: 11800 },
  { year: "2030E", count: 14000 },
];

const powerData = [
  { year: "2022", twh: 240 },
  { year: "2023", twh: 320 },
  { year: "2024", twh: 415 },
  { year: "2025", twh: 520 },
  { year: "2026E", twh: 650 },
  { year: "2030E", twh: 945 },
];

const spendData = [
  { year: "2023", spend: 222 },
  { year: "2024", spend: 330 },
  { year: "2025", spend: 406 },
  { year: "2026E", spend: 600 },
  { year: "2030E", spend: 1000 },
];

const hyperscalers = [
  { company: "Amazon AWS", sites: 241, color: "#f59e0b" },
  { company: "Microsoft Azure", sites: 180, color: "#6366f1" },
  { company: "Google Cloud", sites: 150, color: "#10b981" },
  { company: "Oracle", sites: 47, color: "#ef4444" },
  { company: "Meta", sites: 35, color: "#3b82f6" },
  { company: "Apple", sites: 25, color: "#6b7280" },
];

const statCards = [
  { label: "Total Global DCs", value: "11,038", sub: "174 countries", color: "#6366f1", icon: "🏢" },
  { label: "US Data Centers", value: "4,184", sub: "38% of global total", color: "#8b5cf6", icon: "🇺🇸" },
  { label: "Global Capex 2026", value: "$1T+", sub: "First time ever", color: "#10b981", icon: "💰" },
  { label: "Power Usage 2026", value: "182 GW", sub: "→ 219 GW by 2030", color: "#f59e0b", icon: "⚡" },
  { label: "Market Value 2026", value: "$430B", sub: "→ $1.1T by 2035", color: "#ef4444", icon: "📈" },
  { label: "Water/Day (Large DC)", value: "5M gal", sub: "Cooling only", color: "#3b82f6", icon: "💧" },
];

const TABS = ["Overview", "By Country", "By Type", "Power & Growth", "Spending", "Hyperscalers", "🌍 World Map"];

function CT({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs text-white shadow-xl">
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color || "#a78bfa" }}>{p.name}: {Number(p.value).toLocaleString()}</div>)}
      </div>
    );
  }
  return null;
}

export default function App() {
  const [tab, setTab] = useState("Overview");
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <div className="text-xs text-indigo-400 font-medium tracking-widest mb-1">GLOBAL INFRASTRUCTURE · 2026</div>
          <h1 className="text-2xl font-bold">Data Center Dashboard 🏢</h1>
          <p className="text-gray-400 text-sm mt-1">11,038 centers · 174 countries · $1 trillion capex</p>
        </div>

        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 min-w-max text-xs font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${tab === t ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">

          {tab === "Overview" && (<>
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((s, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex gap-2 items-start">
                  <div className="text-xl">{s.icon}</div>
                  <div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium mb-3">DISTRIBUTION BY REGION</div>
              {byRegion.map((r, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{r.region}</span>
                    <span className="text-indigo-300">{r.count.toLocaleString()} ({r.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${r.pct * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4">
              <div className="text-xs text-yellow-400 font-medium mb-1">⚡ KEY INSIGHT</div>
              <p className="text-gray-300 text-sm leading-relaxed">Virginia alone consumed <span className="text-white font-semibold">25% of the state's entire electricity</span> on data centers in 2025 — projected to hit <span className="text-white font-semibold">46% by 2030</span>. The US data center industry is now a national infrastructure challenge.</p>
            </div>
          </>)}

          {tab === "By Country" && (<>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium mb-3">TOP 8 COUNTRIES (2026)</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byCountry} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis type="category" dataKey="country" tick={{ fill: "#d1d5db", fontSize: 10 }} width={110} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="count" name="Data Centers" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-green-400 font-medium mb-2">🚀 FASTEST GROWING REGIONS</div>
              <div className="space-y-2 text-sm text-gray-300">
                <div>🌏 <span className="text-white font-medium">Asia-Pacific</span> — Fastest CAGR to 2035. Malaysia, India, South Korea leading.</div>
                <div>🌍 <span className="text-white font-medium">Middle East</span> — UAE & Saudi Arabia investing in sovereign AI infrastructure.</div>
                <div>🌎 <span className="text-white font-medium">Latin America</span> — Brazil & Mexico leading. 60%+ powered by renewables.</div>
              </div>
            </div>
          </>)}

          {tab === "By Type" && (<>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium mb-3">DATA CENTER TYPES (2026)</div>
              <div className="flex gap-4 items-center">
                <ResponsiveContainer width="45%" height={180}>
                  <PieChart>
                    <Pie data={byType} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {byType.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CT />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {byType.map((t, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: t.color }} className="font-medium">{t.name}</span>
                        <span className="text-gray-300">{t.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full">
                        <div className="h-1.5 rounded-full" style={{ width: `${(t.value / 8821) * 100}%`, backgroundColor: t.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {[
              { type: "Colocation", icon: "🏢", desc: "Rent rack/cage space to businesses. Largest segment. Europe leads with 1,576 colo sites.", stat: "4,029 globally" },
              { type: "Hyperscale", icon: "🚀", desc: "Massive facilities by AWS, Azure, Google. 54% in the US. Built for AI scale.", stat: "3,207 globally" },
              { type: "Neocloud", icon: "⚡", desc: "GPU-focused AI cloud providers. CoreWeave, Lambda Labs. Fastest growing by revenue.", stat: "890 globally" },
              { type: "Gov/Sovereign", icon: "🏛️", desc: "Nationally controlled for data sovereignty. Fast growth in EU, Middle East, Asia.", stat: "695 globally" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex gap-3">
                <div className="text-xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="text-sm font-semibold text-white">{item.type}</div>
                    <div className="text-xs text-indigo-400">{item.stat}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                </div>
              </div>
            ))}
          </>)}

          {tab === "Power & Growth" && (<>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium mb-3">GLOBAL DATA CENTER COUNT GROWTH</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip content={<CT />} />
                  <Area type="monotone" dataKey="count" name="Data Centers" stroke="#6366f1" fill="url(#cg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-yellow-400 font-medium mb-3">⚡ POWER CONSUMPTION (TWh/year globally)</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={powerData}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip content={<CT />} />
                  <Area type="monotone" dataKey="twh" name="TWh" stroke="#f59e0b" fill="url(#pg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "US Power Share", value: "4%+", sub: "Of US electricity", icon: "🇺🇸", color: "#6366f1" },
                { label: "Virginia 2030", value: "46%", sub: "Of state electricity", icon: "⚡", color: "#f59e0b" },
                { label: "Water/Day", value: "5M gal", sub: "Per large facility", icon: "💧", color: "#3b82f6" },
                { label: "By 2030", value: "219 GW", sub: "= 180M US homes", icon: "🌍", color: "#10b981" },
              ].map((s, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                  <div className="text-xl">{s.icon}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                  <div className="text-xs text-gray-600">{s.sub}</div>
                </div>
              ))}
            </div>
          </>)}

          {tab === "Spending" && (<>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-green-400 font-medium mb-3">💰 GLOBAL CAPEX ($B/year)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={spendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="spend" name="Capex ($B)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium mb-3">📊 MARKET SIZE MILESTONES</div>
              {[
                { year: "2025", val: "$387B", color: "#6366f1" },
                { year: "2026", val: "$430B", color: "#8b5cf6" },
                { year: "2030", val: "$740B", color: "#a78bfa" },
                { year: "2035", val: "$1.1T", color: "#10b981" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                  <span className="text-sm text-gray-300">{item.year}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4">
              <div className="text-xs text-yellow-400 font-medium mb-1">🏗️ PERSPECTIVE</div>
              <p className="text-gray-300 text-sm leading-relaxed">The 2026 data center capex of <span className="text-white font-semibold">$1 trillion</span> is <span className="text-white font-semibold">2x the entire US Interstate Highway System</span> — spent in a single year by private companies racing for AI advantage.</p>
            </div>
          </>)}

          {tab === "Hyperscalers" && (<>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-indigo-400 font-medium mb-3">HYPERSCALER FOOTPRINT (KNOWN SITES)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hyperscalers} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis type="category" dataKey="company" tick={{ fill: "#d1d5db", fontSize: 10 }} width={110} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="sites" name="Known Sites" radius={[0, 4, 4, 0]}>
                    {hyperscalers.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {[
              { company: "Amazon AWS", icon: "📦", spend: "$100B+", sites: "241 known / 900+ est.", note: "Most DC sites of any hyperscaler. 83 sites under construction." },
              { company: "Microsoft Azure", icon: "🪟", spend: "$80B", sites: "180 sites", note: "$80B backlog it can't fulfill — power constraints, not demand." },
              { company: "Google Cloud", icon: "🔍", spend: "$200B 2026", sites: "150 + orbital", note: "Project Suncatcher — first space-based data center by 2027." },
              { company: "Meta", icon: "👓", spend: "$72B", sites: "35 sites", note: "Building 5GW AI data center — largest ever announced." },
              { company: "Nvidia", icon: "💚", spend: "Supplier", sites: "N/A", note: "$193.7B data center revenue FY2026. Grew 68% annually." },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex gap-3">
                <div className="text-xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="text-sm font-semibold text-white">{item.company}</div>
                    <div className="text-xs text-green-400 font-medium">{item.spend}</div>
                  </div>
                  <div className="text-xs text-indigo-300">{item.sites}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.note}</div>
                </div>
              </div>
            ))}
          </>)}

          {tab === "🌍 World Map" && <GeoMap />}
        </div>
        <div className="text-center text-xs text-gray-600 mt-5">Sources: Statista · ABI Research · Programs.com · CBRE · Dell'Oro · 2026</div>
      </div>
    </div>
  );
}
