import { WizardShell } from "@/components/wizard/WizardShell";
import { PaiementStep } from "@/components/wizard/PaiementStep";

export default function Page() {
  return (
    <WizardShell currentStep="paiement">
      <PaiementStep />
    </WizardShell>
  );
}
