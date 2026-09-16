import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const stats = [
  {
    label: "Today's Sales",
    value: "৳12,480",
    change: "+12.5%",
    description: "vs yesterday",
  },
  {
    label: "Orders",
    value: "186",
    change: "+8.2%",
    description: "vs yesterday",
  },
  {
    label: "Customers",
    value: "143",
    change: "+5.4%",
    description: "today",
  },
  {
    label: "Average Order",
    value: "৳67.10",
    change: "+3.1%",
    description: "vs yesterday",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#f7f3ed]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
          {" "}
          {/* Page heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#2b1b12]">Overview</h2>
            <p className="mt-1 text-sm text-[#8c7a6c]">
              Here&apos;s what&apos;s happening in your coffee shop today.
            </p>
          </div>
          {/* Statistics */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-[0_4px_20px_rgba(72,48,32,0.04)]"
              >
                <p className="text-sm text-[#8c7a6c]">{stat.label}</p>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-[#2b1b12]">
                    {stat.value}
                  </h3>

                  <span className="rounded-full bg-[#edf6ee] px-2 py-1 text-xs font-medium text-[#4f8a58]">
                    {stat.change}
                  </span>
                </div>

                <p className="mt-2 text-xs text-[#a39284]">
                  {stat.description}
                </p>
              </div>
            ))}
          </section>
          {/* Main content cards */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Sales overview */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#2b1b12]">
                    Sales Overview
                  </h3>
                  <p className="mt-1 text-sm text-[#8c7a6c]">
                    Sales performance for today
                  </p>
                </div>

                <button className="rounded-lg border border-[#e5dbd0] px-3 py-2 text-sm text-[#66574d] hover:bg-[#faf7f3]">
                  This Week
                </button>
              </div>

              <div className="mt-8 flex h-64 items-end gap-3">
                {[48, 72, 56, 88, 64, 96, 76].map((height, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full rounded-t-lg bg-[#c98b5b]/80"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-[#a39284]">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top products */}
            <div className="rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
              <div>
                <h3 className="font-semibold text-[#2b1b12]">Top Products</h3>
                <p className="mt-1 text-sm text-[#8c7a6c]">
                  Best selling items
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ["Cappuccino", "42 orders", "৳504"],
                  ["Spanish Latte", "36 orders", "৳504"],
                  ["Chicken Sandwich", "29 orders", "৳522"],
                  ["Blueberry Muffin", "24 orders", "৳288"],
                ].map(([name, orders, sales], index) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-[#faf7f3] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ead8c7] text-sm font-semibold text-[#6d4730]">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#2b1b12]">
                          {name}
                        </p>
                        <p className="text-xs text-[#9b897b]">{orders}</p>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-[#6d4730]">
                      {sales}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
