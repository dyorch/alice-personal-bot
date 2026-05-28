'use client';

import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/format';

const TIMEZONES = [
  'America/Lima',
  'America/Bogota',
  'America/Mexico_City',
  'America/Buenos_Aires',
  'UTC',
];

export function SettingsView({
  initialCategories,
  botPhone,
  lastMessageIso,
}: {
  initialCategories: string[];
  botPhone: string;
  lastMessageIso: string;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState('');
  const [tz, setTz] = useState('America/Lima');

  function addCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = draft.trim().toLowerCase();
    if (!value || categories.includes(value)) return;
    setCategories((prev) => [...prev, value]);
    setDraft('');
    toast.success(`Categoría "${value}" añadida`, { description: '(mockup, no persiste)' });
  }

  function removeCategory(c: string) {
    setCategories((prev) => prev.filter((x) => x !== c));
    toast.success(`Categoría "${c}" eliminada`, { description: '(mockup, no persiste)' });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categorías de gasto</CardTitle>
          <CardDescription>Se usan al clasificar y filtrar gastos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c} variant="secondary" className="gap-1 capitalize">
                {c}
                <button
                  type="button"
                  aria-label={`Quitar ${c}`}
                  onClick={() => removeCategory(c)}
                  className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={addCategory}>
            <Input
              placeholder="Nueva categoría…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="max-w-60"
            />
            <Button type="submit" variant="outline">
              <Plus /> Añadir
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona horaria</CardTitle>
          <CardDescription>Define cómo se muestran e interpretan las fechas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tz">Zona horaria del usuario</Label>
            <Select value={tz} onValueChange={(v) => setTz(v ?? 'America/Lima')}>
              <SelectTrigger id="tz" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((z) => (
                  <SelectItem key={z} value={z}>
                    {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
