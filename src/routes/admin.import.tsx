import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileJson, LogIn, PackageOpen, Upload, XCircle } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getLocusImportAccess,
  importLocusObjects,
  type LocusObjectImportResult,
  type LocusObjectManifestEntry,
} from "@/lib/palace/palaceApi";

export const Route = createFileRoute("/admin/import")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lernobjekte importieren | Memory Palace VR" },
      { name: "description", content: "Geschützter Import von Lernkarten und 3D-Objekten für den WarehouseRoom." },
      { property: "og:title", content: "Lernobjekte importieren | Memory Palace VR" },
      { property: "og:description", content: "Geschützter Import von Lernkarten und 3D-Objekten für den WarehouseRoom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminImportPage,
});

type Access = Awaited<ReturnType<typeof getLocusImportAccess>>;

function parseManifest(file: File): Promise<LocusObjectManifestEntry[]> {
  return file.text().then((text) => {
    const value: unknown = JSON.parse(text);
    if (!Array.isArray(value) || value.length === 0) throw new Error("Das Manifest muss ein nicht-leeres Array sein.");

    const entries = value.map((item, index) => {
      if (!item || typeof item !== "object") throw new Error(`Eintrag ${index + 1} ist ungültig.`);
      const entry = item as Record<string, unknown>;
      if (
        !Number.isInteger(entry.id) || Number(entry.id) < 1 || Number(entry.id) > 20 ||
        typeof entry.question !== "string" || !entry.question.trim() ||
        typeof entry.answer !== "string" || !entry.answer.trim() ||
        typeof entry.locus !== "string" || !entry.locus.trim() ||
        typeof entry.file !== "string" || !entry.file.toLowerCase().endsWith(".glb") ||
        typeof entry.triangles !== "number"
      ) throw new Error(`Eintrag ${index + 1} hat fehlende oder ungültige Felder.`);
      return entry as unknown as LocusObjectManifestEntry;
    });

    const ids = entries.map((entry) => entry.id);
    if (new Set(ids).size !== ids.length) throw new Error("Jede Manifest-ID darf nur einmal vorkommen.");
    return entries.sort((a, b) => a.id - b.id);
  });
}

function AdminImportPage() {
  const [access, setAccess] = useState<Access | null>(null);
  const [manifestFile, setManifestFile] = useState<File | null>(null);
  const [modelFiles, setModelFiles] = useState<File[]>([]);
  const [results, setResults] = useState<LocusObjectImportResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getLocusImportAccess().then(setAccess).catch(() => setAccess({ signedIn: false, isAdmin: false, email: null }));
  }, []);

  const selection = useMemo(
    () => `${manifestFile ? "1 Manifest" : "Kein Manifest"} · ${modelFiles.length} GLB-Dateien`,
    [manifestFile, modelFiles.length],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResults([]);
    if (!manifestFile || modelFiles.length === 0) {
      setError("Bitte Manifest und passende GLB-Dateien auswählen.");
      return;
    }

    setBusy(true);
    try {
      const manifest = await parseManifest(manifestFile);
      const expected = new Set(manifest.map((entry) => entry.file));
      const missing = [...expected].filter((name) => !modelFiles.some((file) => file.name === name));
      if (missing.length) throw new Error(`Fehlende Dateien: ${missing.join(", ")}`);
      setResults(await importLocusObjects(manifest, modelFiles));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Memory Palace VR</p>
            <h1 className="mt-1 text-xl font-bold">Lernobjekte importieren</h1>
          </div>
          <Button asChild variant="outline"><Link to="/">Zum Palast</Link></Button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10">
        {!access ? (
          <p className="text-sm text-muted-foreground">Zugriff wird geprüft…</p>
        ) : !access.signedIn ? (
          <div className="max-w-xl border border-border bg-card p-7 shadow-sm">
            <LogIn className="mb-4 size-7 text-primary" />
            <h2 className="text-lg font-bold">Anmeldung erforderlich</h2>
            <p className="mt-2 text-sm text-muted-foreground">Diese Seite akzeptiert Uploads nur aus einer angemeldeten Admin-Sitzung.</p>
          </div>
        ) : !access.isAdmin ? (
          <div className="max-w-xl border border-destructive/40 bg-card p-7 shadow-sm">
            <XCircle className="mb-4 size-7 text-destructive" />
            <h2 className="text-lg font-bold">Keine Admin-Berechtigung</h2>
            <p className="mt-2 text-sm text-muted-foreground">{access.email ?? "Dieses Konto"} ist angemeldet, aber nicht als Admin freigeschaltet.</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <form onSubmit={handleSubmit} className="border border-border bg-card p-7 shadow-sm">
              <div className="flex items-center gap-3"><PackageOpen className="size-6 text-primary" /><h2 className="text-lg font-bold">Neuro-Set</h2></div>
              <p className="mt-2 text-sm text-muted-foreground">Die Manifest-IDs 1–20 werden automatisch den Regalplätzen 0–19 zugeordnet.</p>

              <label className="mt-7 block text-sm font-semibold" htmlFor="manifest">manifest.json</label>
              <Input id="manifest" type="file" accept="application/json,.json" className="mt-2" onChange={(event) => setManifestFile(event.target.files?.[0] ?? null)} />

              <label className="mt-6 block text-sm font-semibold" htmlFor="models">Passende GLB-Dateien</label>
              <Input id="models" type="file" accept="model/gltf-binary,.glb" multiple className="mt-2" onChange={(event) => setModelFiles(Array.from(event.target.files ?? []))} />

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
                <span className="text-xs text-muted-foreground">{selection}</span>
                <Button type="submit" disabled={busy}><Upload />{busy ? "Import läuft…" : "Importieren"}</Button>
              </div>
              {error && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>}
            </form>

            <aside className="border border-border bg-muted/35 p-7">
              <div className="flex items-center gap-3"><FileJson className="size-6 text-primary" /><h2 className="text-lg font-bold">Ergebnis</h2></div>
              {results.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Nach dem Import erscheint hier der Status jeder Datei.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {results.map((result) => (
                    <li key={`${result.cardIndex}-${result.file}`} className="flex gap-3 border-b border-border pb-3 text-sm">
                      {result.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
                      <div><p className="font-semibold">Slot {result.cardIndex - 1}: {result.file}</p><p className="text-muted-foreground">{result.message}</p></div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}