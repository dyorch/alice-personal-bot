import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXPENSE_CATEGORIES } from '@/lib/derived';
import { formatDateTime } from '@/lib/format';

/**
 * Vista de configuración. ACTUALMENTE READ-ONLY: el backend no expone
 * `/api/settings` aún, así que estas preferencias viven hardcoded en el
 * código (EXPENSE_CATEGORIES en lib/derived.ts, TZ "America/Lima" en
 * lib/format.ts). Cuando el endpoint exista, añadir:
 *   - apps/web/src/services/settings.service.ts
 *   - apps/web/src/hooks/use-settings.ts
 *   - migrar este componente a editar vía mutation
 */
export function SettingsView({
  botPhone,
  lastMessageIso,
}: {
  botPhone: string;
  lastMessageIso: string;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categorías de gasto</CardTitle>
          <CardDescription>
            Las categorías están definidas en código (
            <code className="text-xs">lib/derived.ts</code>). Próximamente: configuración persistente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((c) => (
              <Badge key={c} variant="secondary" className="capitalize">
                {c}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona horaria</CardTitle>
          <CardDescription>
            Hardcodeada en <code className="text-xs">lib/format.ts</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Zona horaria del bot</dt>
            <dd>America/Lima</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bot</CardTitle>
          <CardDescription>Información de la cuenta de WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Número de WhatsApp</dt>
            <dd className="tabular-nums">+{botPhone}</dd>
            <dt className="text-muted-foreground">Último mensaje recibido</dt>
            <dd>{formatDateTime(lastMessageIso)}</dd>
            <dt className="text-muted-foreground">Estado</dt>
            <dd>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500" variant="secondary">
                Conectado
              </Badge>
            </dd>
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
