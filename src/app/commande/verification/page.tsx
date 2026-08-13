import { WizardShell } from "@/components/wizard/WizardShell";
import { VerificationStep } from "@/components/wizard/VerificationStep";

export default function Page() {
  return (
    <WizardShell currentStep="verification">
      <VerificationStep />
    </WizardShell>
  );
}
