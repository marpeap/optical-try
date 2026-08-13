import { WizardShell } from "@/components/wizard/WizardShell";
import { InfosPersoStep } from "@/components/wizard/InfosPersoStep";

export default function Page() {
  return (
    <WizardShell currentStep="infos-perso">
      <InfosPersoStep />
    </WizardShell>
  );
}
