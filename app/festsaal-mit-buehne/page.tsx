import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = { title: "Festsaal mit Bühne | Hier Buchen | Königswirt" };

export default function FestsaalPage() {
  return (
    <div className="px-4 pb-14 pt-[29px] lg:px-0">
      <InquiryForm
        title="Festsaal mit Bühne – Ihre vielseitige Eventlocation für unvergessliche Momente"
        location="Anfrage Festsaal mit Bühne"
        wishesPlaceholder="Catering, Sekt- oder Champagnerempfang, etc. "
        dateLabels
      />
    </div>
  );
}
