import { CheatsheetForm } from "../cheatsheet-form";

export default function NewCheatsheetPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Cheatsheets</h1>
          <p className="text-muted-foreground text-sm">
             Build nested sections guides for CLI pipelines or guides seamlessly.
          </p>
        </div>
      </div>

      <CheatsheetForm />
    </div>
  );
}
