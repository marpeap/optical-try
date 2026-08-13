import { WizardShell } from "@/components/wizard/WizardShell";
import { DevisStep } from "@/components/wizard/DevisStep";

export default function Page() {
  return (
    <WizardShell currentStep="devis">
      <DevisStep />
    </WizardShell>
  );
}
