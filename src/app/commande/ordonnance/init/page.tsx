"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { frames } from "@/data/frames";
import { initWizardState, saveWizardState } from "@/lib/wizardState";

export default function InitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const slug = searchParams.get("frame");
    const frame = frames.find((f) => f.slug === slug);

    if (!frame) {
      router.push("/catalogue");
      return;
    }

    saveWizardState(initWizardState(frame));
    router.push("/commande/ordonnance");
  }, [router, searchParams]);

  return <p>Préparation de votre parcours…</p>;
}
