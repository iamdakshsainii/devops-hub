import { ToolForm } from "../tool-form";

export default function NewToolPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Tool</h1>
          <p className="text-muted-foreground text-sm">
             Create reference tools directory guides layout natively.
          </p>
        </div>
      </div>

      <ToolForm />
    </div>
  );
}
