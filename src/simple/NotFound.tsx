import { Home, UserRound } from "lucide-react";
import { BigChoice, Screen } from "./parts";

export function NotFound() {
  return (
    <Screen title="We couldn't find that page." help="It may have moved. Nothing is wrong on your side.">
      <div className="space-y-4">
        <BigChoice to="/start" icon={UserRound} label="Go to the beginning" />
        <BigChoice to="/" icon={Home} tone="warm" label="About TogetherWeGrow" />
      </div>
    </Screen>
  );
}
