import { WizardShell } from "@/components/wizard/WizardShell";
import { ConfirmationStep } from "@/components/wizard/ConfirmationStep";

export default function Page() {
  return (
    <WizardShell currentStep="confirmation">
      <ConfirmationStep />
    </WizardShell>
  );
}
