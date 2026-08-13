import { WizardShell } from "@/components/wizard/WizardShell";
import { TiersPayantStep } from "@/components/wizard/TiersPayantStep";

export default function Page() {
  return (
    <WizardShell currentStep="tiers-payant">
      <TiersPayantStep />
    </WizardShell>
  );
}
