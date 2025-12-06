// src/components/CheckoutStepper.jsx

const STEPS = [
  { id: "cart", label: "Cart" },
  { id: "checkout", label: "Checkout" },
  { id: "finish", label: "Finish" },
];

export default function CheckoutStepper({ activeStep = "checkout" }) {
  return (
    <div className="flex items-center gap-3 text-xs md:text-sm mb-4">
      {STEPS.map((step, index) => {
        const isActive = step.id === activeStep;
        const isCompleted = STEPS.findIndex((s) => s.id === activeStep) > index;

        return (
          <div key={step.id} className="flex items-center gap-2">
            {/* Bullet */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] md:text-xs ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900"
                  : isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                  : "bg-white text-slate-500 border-slate-300"
              }`}
            >
              {index + 1}
            </div>

            {/* Label */}
            <span
              className={`font-medium ${
                isActive
                  ? "text-slate-900"
                  : isCompleted
                  ? "text-emerald-700"
                  : "text-slate-500"
              }`}
            >
              {step.label}
            </span>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div className="w-6 md:w-10 h-px bg-slate-200 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
