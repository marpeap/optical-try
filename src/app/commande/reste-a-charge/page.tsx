import { WizardShell } from "@/components/wizard/WizardShell";
import { ResteAChargeStep } from "@/components/wizard/ResteAChargeStep";

export default function Page() {
  return (
    <WizardShell currentStep="reste-a-charge">
      <ResteAChargeStep />
    </WizardShell>
  );
}
