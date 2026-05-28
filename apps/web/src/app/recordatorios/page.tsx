import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RemindersView } from "@/components/reminders-view";
import { NOW, reminders } from "@/lib/mock-data";

export default function RecordatoriosPage() {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Tus recordatorios programados.
        </p>
        <Button render={<Link href="/recordatorios/nuevo" />}>
          <Plus /> Nuevo
        </Button>
      </div>
      <RemindersView reminders={reminders} nowIso={NOW.toISOString()} />
    </>
  );
}
