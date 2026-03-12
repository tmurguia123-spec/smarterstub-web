import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  Check,
  ChevronRight,
  MapPinned,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Wallet
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import { EmailCaptureForm } from "@/components/email-capture-form";
import { ProviderPills } from "@/components/provider-pill";
import { ScoringExplainer } from "@/components/scoring-explainer";
import { ScorePill } from "@/components/score-pill";
import { SearchBar } from "@/components/search-bar";
import { popularCities, testimonials, trendingSearches } from "@/lib/mock-data";
import { getFeaturedEvents, getTrendingEvents } from "@/lib/ticket-service";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const featuredEvents = await getFeaturedEvents();
  const trendingEvents = await getTrendingEvents();

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden bg-hero-grid">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr,0.9fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-teal-700 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Search once, compare everywhere
            </div>

            <div className="space-y-6">
              <h1 className="max-w-4xl font-[var(--font-display)] text-5xl font-bold leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                The premium ticket decision engine for smarter buys.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                SmarterStub compares top ticket marketplaces, scores every listing with a Buy
                Confidence Score, and surfaces the smartest ticket to buy in seconds.
              </p>
            </div>

            <SearchBar />

            <div className="flex flex-wrap gap-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Explore live events
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-white"
              >
                See how it works
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["6+", "major marketplaces normalized"],
                ["92", "example Buy Confidence Score for a top-ranked listing"],
                ["<30s", "to compare fees, trust, timing, and seat value"]
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                >
                  <div className="text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Smart Deal Ranking preview
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Taylor Swift in Kansas City
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  Compare fees, trust, and checkout speed in one view
                </div>
              </div>
              <ScorePill score={92} />
            </div>

            <div className="mt-6 rounded-[30px] bg-slate-950 p-6 text-white">
              <div className="grid gap-5 sm:grid-cols-[1fr,0.9fr]">
                <div>
                  <div className="text-sm text-slate-300">Lowest estimated total</div>
                  <div className="mt-2 text-5xl font-semibold">$230</div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-emerald-300">
                    <TrendingDown className="h-4 w-4" />
                    Save $20 versus the highest listing
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    What SmarterStub highlights
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <div className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-teal-300" />
                      Verified marketplace badges
                    </div>
                    <div className="flex items-start gap-2">
                      <Wallet className="mt-0.5 h-4 w-4 text-teal-300" />
                      Total cost transparency including fees
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-teal-300" />
                      Buy Confidence Score and smart ranking logic
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  ["TickPick", "$212", "$18", "$230", "Best Overall Buy"],
                  ["Gametime", "$205", "$29", "$234", "Best Premium Value"],
                  ["SeatGeek", "$198", "$44", "$242", "Best Budget Buy"]
                ].map(([provider, base, fees, total, note]) => (
                  <div
                    key={provider}
                    className="grid grid-cols-[1fr,0.75fr,0.75fr,0.75fr] gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <div>
                      <div className="font-medium text-white">{provider}</div>
                      <div className="mt-1 text-xs text-slate-400">{note}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Base</div>
                      <div className="mt-1 font-medium">{base}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Fees</div>
                      <div className="mt-1 font-medium">{fees}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</div>
                      <div className="mt-1 font-semibold text-teal-300">{total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Wallet,
                  title: "Score-first guidance",
                  body: "SmarterStub ranks listings by confidence, not just sticker price."
                },
                {
                  icon: ShieldCheck,
                  title: "Timing-first insight",
                  body: "Buy Now vs Wait recommendations make the market feel legible."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] bg-slate-50 p-5">
                  <item.icon className="h-5 w-5 text-teal-700" />
                  <div className="mt-3 font-semibold text-slate-950">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-[34px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:grid-cols-[0.9fr,1.1fr]">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Signature feature
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
              Buy Confidence Score makes the edge obvious.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Instead of leaving buyers to interpret raw listings, SmarterStub ranks every option by
              all-in value, trust, seat quality, refund flexibility, and market timing.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Best Overall Buy",
              "Best Budget Buy",
              "Best Premium Value",
              "Buy Now vs Wait recommendations"
            ].map((item) => (
              <div key={item} className="rounded-[24px] bg-slate-50 p-5">
                <Check className="h-5 w-5 text-teal-700" />
                <div className="mt-3 text-sm font-medium leading-6 text-slate-700">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <EmailCaptureForm
          title="Track better ticket deals with SmarterStub"
          description="Get deal alerts when prices improve for the artists, teams, and venues you care about. Not ready to buy? We'll watch for better options."
          buttonLabel="Get deal alerts"
          successMessage="You're on the list. We'll keep watch for better deals."
          source="homepage"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <ScoringExplainer />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="how-it-works">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            How it works
          </div>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
            Built for buyers who want speed, clarity, and confidence.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            [
              "01",
              "Search any event, artist, team, or venue",
              "Type Taylor Swift, Chiefs tickets, MSG concerts, or a venue and start from one premium search surface."
            ],
            [
              "02",
              "SmarterStub compares listings side by side",
              "We normalize base price, fees, trust signals, and provider badges so the real total is obvious."
            ],
            [
              "03",
              "Choose the smartest deal for your intent",
              "Optimize for lowest total, lowest fees, trusted marketplace, or checkout speed depending on how you buy."
            ]
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{step}</div>
              <div className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{title}</div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[34px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">
              Trending searches
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight">
              Demand signals worth showing in a live demo.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {trendingSearches.map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Popular cities
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {popularCities.map((city) => (
                <Link
                  key={city.city}
                  href={`/search?q=${encodeURIComponent(city.city)}`}
                  className="flex items-center justify-between rounded-[24px] bg-slate-50 px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <div>
                    <div className="font-semibold text-slate-950">
                      {city.city}, {city.state}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{city.searches}</div>
                  </div>
                  <MapPinned className="h-5 w-5 text-teal-700" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Featured events
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
              Event cards with real buyer signals.
            </h2>
          </div>
          <Link href="/search" className="hidden items-center gap-2 text-sm font-semibold text-slate-950 lg:inline-flex">
            View all events
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:grid-cols-[0.8fr,1.2fr]">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Verified providers
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
              Major marketplaces, one premium comparison layer.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              SmarterStub shows verified marketplace framing, trust scores, and fee expectations so
              the product feels credible before any real API integrations are added.
            </p>
          </div>
          <ProviderPills />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
        <div className="rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Trending now
          </div>
          <div className="mt-6 grid gap-4">
            {trendingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="group flex items-center justify-between rounded-[24px] bg-slate-50 px-5 py-4 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <div>
                  <div className="font-semibold text-slate-950">{event.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {event.city}, {event.state}
                  </div>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Trending
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-slate-200 bg-gradient-to-br from-white to-orange-50 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <Bell className="h-4 w-4 text-orange-500" />
            Price alerts and waitlist
          </div>
          <h2 className="mt-5 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
            Capture demand before provider integrations go live.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Let users save a search, join a waitlist, or request alerts when totals fall below
            their target price.
          </p>
          <form className="mt-8 space-y-3">
            <input
              type="email"
              placeholder="Email address"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
            <input
              type="text"
              placeholder="Event, artist, team, or venue"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
            <button
              type="button"
              className="w-full rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:shadow-lg"
            >
              Join waitlist
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Social proof
            </div>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
              Early user feedback that builds trust.
            </h2>
            <div className="mt-8 grid gap-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-base leading-7 text-slate-700">“{testimonial.quote}”</p>
                  <div className="mt-4 text-sm font-semibold text-slate-950">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">
              Why buyers switch
            </div>
            <div className="mt-6 space-y-4">
              {[
                ["Verified marketplace framing", "Make trusted providers obvious before click-through."],
                ["Estimated total cost transparency", "Show fees and totals before the handoff to the provider."],
                ["Best-value ranking", "Balance price, section quality, and trust instead of sorting on sticker price alone."]
              ].map(([title, body]) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Building2 className="h-4 w-4 text-teal-300" />
                    {title}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[24px] bg-white/5 p-5">
              <div className="text-sm text-slate-400">Example savings surfaced in the mock catalog</div>
              <div className="mt-2 text-4xl font-semibold text-teal-300">{formatCurrency(20)}</div>
              <div className="mt-1 text-sm text-slate-300">
                Median savings visible when comparing the best total versus the highest listing.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
