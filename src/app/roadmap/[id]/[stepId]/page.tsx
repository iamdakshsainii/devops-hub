import { redirect } from "next/navigation";

export default async function StepDetailPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;
  // Redirect to the unified module content page with roadmap context
  redirect(`/modules/${stepId}?roadmapId=${id}`);
}