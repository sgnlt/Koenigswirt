import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import legal from "@/content/legal.json";

export const metadata: Metadata = { title: "Impressum | Königswirt" };

export default function Page() {
  return <LegalPage blocks={legal.impressum} />;
}
