import { useState } from "react";
import { PlaygroundShell } from "./app/PlaygroundShell";
// import { SpikeShell } from "./spike/SpikeShell";
// import { shellLabels } from "./data/labels";

/**
 * Two views, no router (the app is a two-state toggle — a router would be
 * premature): the playground and the frozen CSS-isolation regression harness.
 */
export default function App() {
  const [view, setView] = useState<"playground" | "spike">("playground");
  return view === "playground" ? (
    <PlaygroundShell onOpenSpike={() => setView("spike")} />
  ) : (
    // <div>
    //   <div className="spike-return-bar">
    //     <button type="button" onClick={() => setView('playground')}>
    //       {shellLabels.spikeBack}
    //     </button>
    //   </div>
    //   <SpikeShell />
    // </div>
    <PlaygroundShell onOpenSpike={() => setView("spike")} />
  );
}
