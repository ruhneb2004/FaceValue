import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms | FaceValue" };

export default function Terms() {
  return (
    <LegalPage
        title="Terms"
        updated="6 November 2026"
        sections={[
          {
            h: "No licence is created here",
            p: "FaceValue is a registry interface. It is not a party to any licence between a registrant and a licensee, and it does not represent either side.",
          },
          {
            h: "Demo data",
            p: "Entries, prices, bonds and dispute records shown in this build are sample data. They are not offers and nothing on this site can be bought.",
          },
          {
            h: "Face matching",
            p: "Matching compares a submitted face against a frozen reference and returns a score. It is a technical signal, not a legal determination of identity.",
          },
          {
            h: "No warranty",
            p: "This build is provided as is, for evaluation. It carries no warranty of availability, accuracy or fitness for any purpose.",
          },
        ]}
      />
  );
}
