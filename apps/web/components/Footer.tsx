import Image from "next/image";
import Link from "next/link";

/** Shared footer: legal links and a way back from every page (B10). */
export function Footer() {
  return (
    <footer className="border-t border-line bg-surface2">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[46ch]">
            <Image
              src="/logo-footer.png"
              alt="facevalue"
              width={800}
              height={195}
              className="h-6 w-auto"
            />
            <p className="caption-5 mt-2 text-ink3">
              FaceValue is not a party to any licence. This is a testnet demo:
              every record and price is seeded sample data.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-2">
            <div>
              <p className="caption-3 text-ink">Product</p>
              <ul className="mt-2 space-y-space-y">
                <li>
                  <FooterLink href="/explore">Explore</FooterLink>
                </li>
                <li>
                  <FooterLink href="/register">Register</FooterLink>
                </li>
                <li>
                  <FooterLink href="/admin/review">Resolve</FooterLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="caption-3 text-ink">Legal</p>
              <ul className="mt-2 space-y-space-y">
                <li>
                  <FooterLink href="/legal/privacy">Privacy</FooterLink>
                </li>
                <li>
                  <FooterLink href="/legal/terms">Terms</FooterLink>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="press caption-5 block py-3 text-ink2 hover:text-ink"
    >
      {children}
    </Link>
  );
}
