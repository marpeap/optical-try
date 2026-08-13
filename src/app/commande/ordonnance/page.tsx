import { WizardShell } from "@/components/wizard/WizardShell";
import { OrdonnanceStep } from "@/components/wizard/OrdonnanceStep";

export default function Page() {
  return (
    <WizardShell currentStep="ordonnance">
      <OrdonnanceStep />
    </WizardShell>
  );
}
