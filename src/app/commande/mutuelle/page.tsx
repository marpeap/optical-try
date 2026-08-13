import { WizardShell } from "@/components/wizard/WizardShell";
import { MutuelleStep } from "@/components/wizard/MutuelleStep";

export default function Page() {
  return (
    <WizardShell currentStep="mutuelle">
      <MutuelleStep />
    </WizardShell>
  );
}
