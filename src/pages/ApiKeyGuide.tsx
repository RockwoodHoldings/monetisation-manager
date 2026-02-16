import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ShieldCheck, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApiKeyGuide() {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center gap-6 py-12 px-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-extrabold bg-gradient-to-br from-foreground via-primary-light to-primary bg-clip-text text-transparent mb-3">
          Creating an API Key
        </h1>
        <p className="text-muted-foreground">
          Follow these steps to create an Open Cloud API key for your experience.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-secondary/60 backdrop-blur-sm p-6 flex flex-col gap-5">
        <ol className="list-none flex flex-col gap-4 text-sm text-foreground">
          <li className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold">1</span>
            <span>
              Go to the{" "}
              <a
                href="https://create.roblox.com/dashboard/credentials"
                target="_blank"
                rel="noopener"
                className="text-primary-light underline underline-offset-2"
              >
                Roblox Creator Dashboard
              </a>{" "}
              and navigate to <strong>Credentials</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold">2</span>
            <span>Click <strong>Create API Key</strong> and give it a name you'll recognise.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold">3</span>
            <span>
              Under <strong>Access Permissions</strong>, add the following APIs:
              <ul className="mt-2 ml-1 flex flex-col gap-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">-</span>
                  <span><strong className="text-foreground">Game Passes</strong> &mdash; read &amp; write</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">-</span>
                  <span><strong className="text-foreground">Developer Products</strong> &mdash; read &amp; write</span>
                </li>
              </ul>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold">4</span>
            <span>
              Under <strong>Security</strong>, add an accepted IP address. Use <strong>0.0.0.0/0</strong> to allow all IPs (simplest for personal use).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold">5</span>
            <span>Click <strong>Save &amp; Generate Key</strong>, then copy the key. You won't be able to see it again.</span>
          </li>
        </ol>
      </div>

      <div className="rounded-xl border border-border bg-secondary/60 backdrop-blur-sm p-5 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>
            Your API key is <strong className="text-foreground">never stored on any server</strong>. All data stays in your browser and requests are made directly to Roblox. This project is completely{" "}
            <a
              href="https://github.com/RockwoodHoldings/monetisation-manager"
              target="_blank"
              rel="noopener"
              className="text-primary-light underline underline-offset-2"
            >
              open source
            </a>.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" asChild>
          <a
            href="https://create.roblox.com/dashboard/credentials"
            target="_blank"
            rel="noopener"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Creator Dashboard
          </a>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a
            href="https://github.com/RockwoodHoldings/monetisation-manager"
            target="_blank"
            rel="noopener"
          >
            <Github className="h-4 w-4 mr-2" />
            View on GitHub
          </a>
        </Button>
        <Button variant="ghost" size="lg" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Setup
          </Link>
        </Button>
      </div>
    </div>
  );
}
