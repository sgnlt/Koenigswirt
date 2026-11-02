import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import legal from "@/content/legal.json";

export const metadata: Metadata = { title: "Privacy Policy | Königswirt" };

export default function Page() {
  return <LegalPage blocks={legal.privacy} />;
}
