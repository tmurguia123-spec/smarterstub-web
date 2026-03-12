export function ScoringExplainer() {
  return (
    <details className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
        How SmarterStub scores deals
      </summary>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 sm:grid-cols-2">
        <div className="rounded-[20px] bg-slate-50 p-4">
          Buy Confidence Score blends total price after fees, fee percentage, section and row quality,
          and value versus comparable seats.
        </div>
        <div className="rounded-[20px] bg-slate-50 p-4">
          It also weighs provider trust, refund flexibility, delivery reliability, quantity, and
          scarcity for the event.
        </div>
        <div className="rounded-[20px] bg-slate-50 p-4">
          Deal Ratings map score bands into `Amazing`, `Great`, `Fair`, and `Overpriced` to make
          the decision legible quickly.
        </div>
        <div className="rounded-[20px] bg-slate-50 p-4">
          Buy Now vs Wait uses mock historical pricing trends to estimate whether the market is
          rising, stable, or softening.
        </div>
      </div>
    </details>
  );
}
