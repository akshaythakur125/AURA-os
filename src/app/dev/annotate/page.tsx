"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// ponytail: full internal annotation app — all features, no skips

type AnnotationGoal = "dating" | "instagram" | "content" | "linkedin" | "college" | "festival" | "travel" | "office" | "general";
type Usability = "good" | "usable-with-limitations" | "insufficient";
type BlurSeverity = "none" | "mild" | "moderate" | "severe";
type Exposure = "normal" | "underexposed" | "overexposed" | "severely-underexposed" | "severely-overexposed";
type FaceVisibility = "clear" | "partial" | "occluded" | "none";
type SubjectSize = "large" | "medium" | "small" | "tiny";
type Headroom = "good" | "too-much" | "too-little" | "face-cut";
type Crop = "good" | "too-tight" | "too-loose" | "off-centre";
type BackgroundClutter = "clean" | "mild" | "moderate" | "severe";
type Separation = "strong" | "adequate" | "weak" | "none";
type PoseSuitability = "good" | "acceptable" | "unsuitable";
type GoalSuitability = "good" | "acceptable" | "unsuitable";
type RecommendationRelevance = "high" | "medium" | "low" | "not-supported";
type Supported = "yes" | "partially" | "no";

type Annotation = {
  imageId: string; goal: AnnotationGoal; usability: Usability | null; blurSeverity: BlurSeverity | null;
  exposure: Exposure | null; faceVisibility: FaceVisibility | null; subjectSize: SubjectSize | null;
  headroom: Headroom | null; crop: Crop | null; backgroundClutter: BackgroundClutter | null;
  separation: Separation | null; poseSuitability: PoseSuitability | null; goalSuitability: GoalSuitability | null;
  recommendationRelevance: RecommendationRelevance | null; recommendationSupported: Supported | null;
  notes: string; skipped: boolean; annotatedAt: string; annotatorId: string;
};

type AuditLog = { action: string; imageId: string; annotatorId: string; timestamp: string; details?: string };

type ImageEntry = { id: string; src: string; label: string; goal: AnnotationGoal; isQc?: boolean };

const STORAGE_KEY = "aura_annotations";
const AUDIT_KEY = "aura_annotation_audit";
const ANNOTATOR_KEY = "aura_annotator_id";
const GOALS: AnnotationGoal[] = ["dating", "instagram", "content", "linkedin", "college", "festival", "travel", "office", "general"];

function getAnnotatorId(): string {
  if (typeof window === "undefined") return "unknown";
  let id = localStorage.getItem(ANNOTATOR_KEY);
  if (!id) { id = `annotator-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; localStorage.setItem(ANNOTATOR_KEY, id); }
  return id;
}
function loadJson<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch { return fallback; } }
function saveJson(key: string, data: unknown) { localStorage.setItem(key, JSON.stringify(data)); }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (i * 2654435761) >>> 0 % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

export default function AnnotatePage() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [current, setCurrent] = useState<Partial<Annotation>>({});
  const [view, setView] = useState<"annotate" | "report" | "audit">("annotate");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const annotatorId = typeof window !== "undefined" ? getAnnotatorId() : "unknown";

  useEffect(() => { setAnnotations(loadJson(STORAGE_KEY, [])); setAuditLog(loadJson(AUDIT_KEY, [])); }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files?.length) return;
    const newImages: ImageEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]; const url = URL.createObjectURL(file);
      newImages.push({ id: `upload-${Date.now()}-${i}`, src: url, label: file.name, goal: GOALS[i % GOALS.length] });
      if (i % 5 === 0) newImages.push({ ...newImages[newImages.length - 1], id: `qc-${Date.now()}-${i}`, isQc: true, label: `[QC] ${file.name}` });
    }
    setImages(shuffle(newImages)); setCurrentIndex(0);
  }, []);

  const image = images[currentIndex];

  function logAudit(action: string, imageId: string, details?: string) {
    const entry: AuditLog = { action, imageId, annotatorId, timestamp: new Date().toISOString(), details };
    const updated = [...auditLog, entry]; setAuditLog(updated); saveJson(AUDIT_KEY, updated);
  }

  function handleSave(skip = false) {
    if (!image) return;
    const annotation: Annotation = {
      imageId: image.id, goal: image.goal, usability: (current.usability as Usability) || null,
      blurSeverity: (current.blurSeverity as BlurSeverity) || null, exposure: (current.exposure as Exposure) || null,
      faceVisibility: (current.faceVisibility as FaceVisibility) || null, subjectSize: (current.subjectSize as SubjectSize) || null,
      headroom: (current.headroom as Headroom) || null, crop: (current.crop as Crop) || null,
      backgroundClutter: (current.backgroundClutter as BackgroundClutter) || null, separation: (current.separation as Separation) || null,
      poseSuitability: (current.poseSuitability as PoseSuitability) || null, goalSuitability: (current.goalSuitability as GoalSuitability) || null,
      recommendationRelevance: (current.recommendationRelevance as RecommendationRelevance) || null,
      recommendationSupported: (current.recommendationSupported as Supported) || null,
      notes: current.notes || "", skipped: skip, annotatedAt: new Date().toISOString(), annotatorId,
    };
    const updated = [...annotations.filter(a => !(a.imageId === image.id && a.annotatorId === annotatorId)), annotation];
    setAnnotations(updated); saveJson(STORAGE_KEY, updated);
    logAudit(skip ? "skip" : "annotate", image.id, skip ? "skipped" : `labels: ${Object.keys(current).filter(k => current[k as keyof typeof current] && k !== "notes").length}`);
    setCurrent({}); setCurrentIndex(i => Math.min(i + 1, images.length - 1));
  }

  function handleDelete(imageId: string) {
    const updated = annotations.filter(a => a.imageId !== imageId);
    setAnnotations(updated); saveJson(STORAGE_KEY, updated);
    logAudit("delete", imageId, `deleted ${annotations.filter(a => a.imageId === imageId).length} annotations`);
    setDeleteConfirm(null);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ annotations, auditLog, exportedAt: new Date().toISOString(), annotatorId }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `annotations-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  }

  // ─── Reports ───
  function computeReports() {
    const total = annotations.length; const skipped = annotations.filter(a => a.skipped).length;
    const annotated = total - skipped;
    const byGoal = GOALS.map(g => ({ goal: g, count: annotations.filter(a => a.goal === g && !a.skipped).length }));
    const byUsability = ["good", "usable-with-limitations", "insufficient"].map(u => ({ label: u, count: annotations.filter(a => a.usability === u).length }));
    const byAnnotator = [...new Set(annotations.map(a => a.annotatorId))].map(id => ({
      id: id.slice(0, 16), count: annotations.filter(a => a.annotatorId === id).length,
      skipped: annotations.filter(a => a.annotatorId === id && a.skipped).length,
    }));

    // Inter-rater: images annotated by multiple annotators
    const imageIds = [...new Set(annotations.map(a => a.imageId))];
    const multiRater = imageIds.filter(id => new Set(annotations.filter(a => a.imageId === id).map(a => a.annotatorId)).size > 1);
    const consensus = multiRater.filter(id => {
      const anns = annotations.filter(a => a.imageId === id && !a.skipped);
      if (anns.length < 2) return true;
      return anns.every(a => a.usability === anns[0].usability);
    });
    const disagreement = multiRater.filter(id => {
      const anns = annotations.filter(a => a.imageId === id && !a.skipped);
      if (anns.length < 2) return false;
      return !anns.every(a => a.usability === anns[0].usability);
    });

    // Missing labels
    const requiredFields: (keyof Annotation)[] = ["usability", "blurSeverity", "exposure", "faceVisibility", "subjectSize", "headroom", "crop", "backgroundClutter", "separation", "poseSuitability", "goalSuitability"];
    const missingLabels = annotations.filter(a => !a.skipped).filter(a => requiredFields.some(f => !a[f])).length;

    // Dataset balance
    const goalBalance = byGoal.every(g => g.count > 0) ? "balanced" : "imbalanced";
    const usabilityBalance = byUsability.every(u => u.count > 0) ? "balanced" : "imbalanced";

    return { total, skipped, annotated, byGoal, byUsability, byAnnotator, multiRater: multiRater.length, consensus: consensus.length, disagreement: disagreement.length, missingLabels, goalBalance, usabilityBalance };
  }

  if (!images.length) {
    return (
      <Container className="py-8">
        <h1 className="mb-2 text-xl font-bold text-[#1C1917]">Portrait Annotation</h1>
        <p className="mb-6 text-xs text-[#857b6e]">Internal tool. Upload approved images (licensed, synthetic, consented). No public indexing.</p>
        <Card className="p-6">
          <p className="mb-4 text-sm text-[#6f675e]">Upload images. QC duplicates auto-added every 5th image.</p>
          <label className="inline-block cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <Button size="sm">Upload Images</Button>
          </label>
        </Card>
      </Container>
    );
  }

  if (view === "audit") {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#1C1917]">Audit Log</h1>
          <Button size="sm" onClick={() => setView("annotate")}>Back</Button>
        </div>
        <div className="space-y-1">
          {auditLog.slice(-50).reverse().map((entry, i) => (
            <p key={i} className="text-[10px] text-[#6f675e]">
              <span className="text-[#857b6e]">{new Date(entry.timestamp).toLocaleTimeString()}</span> {entry.action} {entry.imageId.slice(0, 20)} by {entry.annotatorId.slice(0, 12)}{entry.details ? ` (${entry.details})` : ""}
            </p>
          ))}
        </div>
      </Container>
    );
  }

  if (view === "report") {
    const r = computeReports();
    return (
      <Container className="py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#1C1917]">Annotation Report</h1>
          <div className="flex gap-2"><Button size="sm" onClick={() => setView("annotate")}>Back</Button><Button size="sm" onClick={handleExport}>Export</Button></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Card className="p-3"><p className="text-xs text-[#857b6e]">Total</p><p className="text-lg font-bold text-[#1C1917]">{r.total}</p></Card>
          <Card className="p-3"><p className="text-xs text-[#857b6e]">Annotated</p><p className="text-lg font-bold text-emerald-400">{r.annotated}</p></Card>
          <Card className="p-3"><p className="text-xs text-[#857b6e]">Skipped</p><p className="text-lg font-bold text-yellow-400">{r.skipped}</p></Card>
          <Card className="p-3"><p className="text-xs text-[#857b6e]">Missing Labels</p><p className="text-lg font-bold text-orange-400">{r.missingLabels}</p></Card>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-[#1C1917]">By Goal ({r.goalBalance})</h3>
            {r.byGoal.map(g => <p key={g.goal} className="text-xs text-[#6f675e]">{g.goal}: {g.count}</p>)}
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-[#1C1917]">By Usability ({r.usabilityBalance})</h3>
            {r.byUsability.map(u => <p key={u.label} className="text-xs text-[#6f675e]">{u.label}: {u.count}</p>)}
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-[#1C1917]">By Annotator</h3>
            {r.byAnnotator.map(a => <p key={a.id} className="text-xs text-[#6f675e]">{a.id}: {a.count} annotated, {a.skipped} skipped</p>)}
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-[#1C1917]">Inter-Rater</h3>
            <p className="text-xs text-[#6f675e]">Multi-rater images: {r.multiRater}</p>
            <p className="text-xs text-[#6f675e]">Consensus: {r.consensus}</p>
            <p className="text-xs text-[#6f675e]">Disagreement: {r.disagreement}</p>
          </Card>
        </div>
      </Container>
    );
  }

  // ─── Annotation view ───
  const existingForImage = annotations.find(a => a.imageId === image?.id && a.annotatorId === annotatorId);
  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#1C1917]">Annotate</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setView("report")}>Report</Button>
          <Button size="sm" onClick={() => setView("audit")}>Audit</Button>
          <Button size="sm" onClick={handleExport}>Export</Button>
        </div>
      </div>
      <p className="mb-4 text-xs text-[#857b6e]">
        Image {currentIndex + 1}/{images.length} · Goal: {image?.goal}{image?.isQc ? " · ⚠️ QC DUPLICATE" : ""} · Annotator: {annotatorId.slice(0, 12)}
        {existingForImage && <span className="ml-2 text-emerald-400">✓ already annotated</span>}
      </p>

      {deleteConfirm && (
        <Card className="mb-4 border-red-500/20 bg-red-500/5 p-4">
          <p className="mb-2 text-xs text-red-400">Delete all annotations for this image?</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleDelete(deleteConfirm)}>Confirm Delete</Button>
            <Button size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {image && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-2">
            <img src={image.src} alt={image.label} className="w-full rounded-lg object-contain" style={{ maxHeight: "60vh" }} />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-[#857b6e]">{image.label}</p>
              <button className="text-[10px] text-red-400 hover:text-red-300" onClick={() => setDeleteConfirm(image.id)}>Delete</button>
            </div>
          </Card>
          <div className="space-y-3">
            <Sel label="Usability" value={current.usability} onChange={v => setCurrent(p => ({ ...p, usability: v as Usability }))} opts={["good", "usable-with-limitations", "insufficient"]} />
            <Sel label="Blur Severity" value={current.blurSeverity} onChange={v => setCurrent(p => ({ ...p, blurSeverity: v as BlurSeverity }))} opts={["none", "mild", "moderate", "severe"]} />
            <Sel label="Exposure" value={current.exposure} onChange={v => setCurrent(p => ({ ...p, exposure: v as Exposure }))} opts={["normal", "underexposed", "overexposed", "severely-underexposed", "severely-overexposed"]} />
            <Sel label="Face Visibility" value={current.faceVisibility} onChange={v => setCurrent(p => ({ ...p, faceVisibility: v as FaceVisibility }))} opts={["clear", "partial", "occluded", "none"]} />
            <Sel label="Subject Size" value={current.subjectSize} onChange={v => setCurrent(p => ({ ...p, subjectSize: v as SubjectSize }))} opts={["large", "medium", "small", "tiny"]} />
            <Sel label="Headroom" value={current.headroom} onChange={v => setCurrent(p => ({ ...p, headroom: v as Headroom }))} opts={["good", "too-much", "too-little", "face-cut"]} />
            <Sel label="Crop" value={current.crop} onChange={v => setCurrent(p => ({ ...p, crop: v as Crop }))} opts={["good", "too-tight", "too-loose", "off-centre"]} />
            <Sel label="Background Clutter" value={current.backgroundClutter} onChange={v => setCurrent(p => ({ ...p, backgroundClutter: v as BackgroundClutter }))} opts={["clean", "mild", "moderate", "severe"]} />
            <Sel label="Subject-Background Separation" value={current.separation} onChange={v => setCurrent(p => ({ ...p, separation: v as Separation }))} opts={["strong", "adequate", "weak", "none"]} />
            <Sel label="Pose Suitability" value={current.poseSuitability} onChange={v => setCurrent(p => ({ ...p, poseSuitability: v as PoseSuitability }))} opts={["good", "acceptable", "unsuitable"]} />
            <Sel label="Goal Suitability" value={current.goalSuitability} onChange={v => setCurrent(p => ({ ...p, goalSuitability: v as GoalSuitability }))} opts={["good", "acceptable", "unsuitable"]} />
            <Sel label="Recommendation Relevance" value={current.recommendationRelevance} onChange={v => setCurrent(p => ({ ...p, recommendationRelevance: v as RecommendationRelevance }))} opts={["high", "medium", "low", "not-supported"]} />
            <Sel label="Recommendation Supported by Evidence" value={current.recommendationSupported} onChange={v => setCurrent(p => ({ ...p, recommendationSupported: v as Supported }))} opts={["yes", "partially", "no"]} />
            <div>
              <label className="mb-1 block text-xs text-[#6f675e]">Notes</label>
              <textarea className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.03] p-2 text-xs text-[#1C1917]" rows={2} value={current.notes || ""} onChange={e => setCurrent(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSave(false)}>Save</Button>
              <Button size="sm" onClick={() => handleSave(true)}>Skip</Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

function Sel({ label, value, onChange, opts }: { label: string; value?: string | null; onChange: (v: string) => void; opts: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-[#6f675e]">{label}</label>
      <select className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.03] p-2 text-xs text-[#1C1917]" value={value || ""} onChange={e => onChange(e.target.value)}>
        <option value="">— select —</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
