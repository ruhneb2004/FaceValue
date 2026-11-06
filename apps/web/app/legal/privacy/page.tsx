import { SiteHeader } from "@/components/SiteHeader";
import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy | FaceValue" };

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <LegalPage
        title="Privacy"
        updated="6 November 2026"
        sections={[
          {
            h: "This is a testnet demo",
            p: "Every record on this site is seeded sample data. No real person's likeness, image or personal data is stored, and the wallet is a local stand in that asks for no signature.",
          },
          {
            h: "What would be written to chain",
            p: "On a live deployment, only a hash of the reference face data, the licence terms and the bond would be written. The image, the embedding and any nullifier would stay off chain.",
          },
          {
            h: "What is stored in your browser",
            p: "The demo wallet keeps a generated address in local storage so a refresh does not disconnect you. Clearing site data removes it. Nothing is sent to a server.",
          },
          {
            h: "Cookies and analytics",
            p: "This build sets no advertising cookies and runs no third party analytics.",
          },
        ]}
      />
    </>
  );
}
