import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/Button";

/** B10 — a custom, branded 404 with a way back. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex min-h-[60dvh] w-full max-w-[1440px] items-center px-3 py-3 md:px-3"
      >
        <div className="max-w-[680px]">
          <p className="caption-4 font-mono uppercase tracking-[0.06em] text-ink3">
            404
          </p>
          <h1 className="heading-4 mt-2 text-ink">This record does not exist</h1>
          <p className="body-3 mt-2 max-w-[48ch] text-ink2">
            The likeness, licence or challenge you asked for is not in the
            registry. It may have been revoked, or the link may be wrong.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button href="/explore" size="lg">
              Explore likenesses
            </Button>
            <Button href="/" size="lg" variant="secondary">
              Back to overview
            </Button>
          </div>
          <p className="caption-5 mt-2 text-ink3">
            Looking for something specific?{" "}
            <Link href="/explore" className="text-accent hover:underline">
              Search the registry
            </Link>
            .
          </p>
        </div>
      </main>
    </>
  );
}
