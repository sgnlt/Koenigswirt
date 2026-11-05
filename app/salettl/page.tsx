import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = { title: "Salettl | Hier Buchen | Königswirt" };

export default function SalettlPage() {
  return (
    <div className="px-4 pb-16 pt-8 lg:px-0">
      <InquiryForm
        title="Eventlocation 'Salettl' – Einzigartige Atmosphäre für besondere Anlässe"
        location="Anfrage Salettl"
        wishesPlaceholder="Catering, Getränkepaket, Gästeanzahl, etc."
        dateLabels
      />
    </div>
  );
}
