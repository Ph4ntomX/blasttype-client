import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>
            <span className={title({ color: "yellow" })}>Sleek and fun</span> typing practice for everyone to enjoy.
          </span>
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
          >
            Create Account
          </Button>
          <Button
            className={buttonStyles({ variant: "bordered", radius: "full" })}
          >
            Log In
          </Button>
        </div>
      </section>
    </DefaultLayout>
  );
}
