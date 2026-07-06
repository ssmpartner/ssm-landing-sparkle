import { supabase } from "@/integrations/supabase/client";

export type LeadActivityType =
  | "created"
  | "status"
  | "quelle"
  | "edit"
  | "note"
  | "comment";

export async function logLeadActivity(
  leadId: string,
  actor: string,
  type: LeadActivityType,
  description: string
) {
  const { error } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    actor,
    type,
    description,
  });
  if (error) {
    // Logging failures should never block the main action.
    console.error("Aktivität konnte nicht protokolliert werden:", error.message);
  }
}
