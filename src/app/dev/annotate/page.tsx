"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// ponytail: internal annotation app — localStorage persistence, blind annotation, randomized order

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
  imageId: string;
  goal: AnnotationGoal;
  usability: Usability | null;
  blurSeverity: BlurSeverity | null;
  exposure: Exposure | null;
  faceVisibility: FaceVisibility | null;
  subjectSize: SubjectSize | null;
  headroom: Headroom | null;
  crop: Crop | null;
  backgroundClutter: BackgroundClutter | null;
  separation: Separation | null;
  poseSuitability: PoseSuitability | null;
  goalSuitability: GoalSuitability | null;
  recommendationRelevance: RecommendationRelevance | null;
  recommendationSupported: Supported | null;
  notes: string;
  skipped: boolean;
  annotatedAt: string;
  annotatorId: string;
};

type ImageEntry = {
  id: string;
  src: string;
  label: string;
  goal: AnnotationGoal;
  isQc?: boolean; // quality-control duplicate
};

const STORAGE_KEY = "aura_annotations";
const ANNOTATOR_KEY = "aura_annotator_id";

function getAnnotatorId(): string {
  if (typeof window === "undefined") return "unknown";
  let id = localStorage.getItem(ANNOTATOR_KEY);
  if (!id) {
    id = `annotator-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(ANNOTATOR_KEY, id);
  }
  return id;
}

function loadAnnotations(): Annotation[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveAnnotations(annotations: Annotation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (i * 2654435761) >>> 0 % (i + 1); // deterministic shuffle
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GOALS: AnnotationGoal[] = ["dating", "instagram", "content", "linkedin", "college", "festival", "travel", "office", "general"];

export default function AnnotatePage() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [current, setCurrent] = useState<Partial<Annotation>>({});
  const [showReport, setShowReport] = useState(false);
  const annotatorId = typeof window !== "undefined" ? getAnnotatorId() : "unknown";

  useEffect(() => {
    setAnnotations(loadAnnotations());
  }, []);

  // Load images from uploaded files or fixture metadata
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newImages: ImageEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newImages.push({
        id: `upload-${Date.now()}-${i}`,
        src: url,
        label: file.name,
        goal: GOALS[i % GOALS.length],
      });
    }
    setImages(shuffle(newImages));
    setCurrentIndex(0);
  }, []);

  const image = images[currentIndex];
  const existingForImage = annotations.find(a => a.imageId === image?.id && a.annotatorId === annotatorId);

  function handleSave(skip = false) {
    if (!image) return;
    const annotation: Annotation = {
      imageId: image.id,
      goal: image.goal,
      usability: (current.usability as Usability) || null,
      blurSeverity: (current.blurSeverity as BlurSeverity) || null,
      exposure: (current.exposure as Exposure) || null,
      faceVisibility: (current.faceVisibility as FaceVisibility) || null,
      subjectSize: (current.subjectSize as SubjectSize) || null,
      headroom: (current.headroom as Headroom) || null,
      crop: (current.crop as Crop) || null,
      backgroundClutter: (current.backgroundClutter as BackgroundClutter) || null,
      separation: (current.separation as Separation) || null,
      poseSuitability: (current.poseSuitability as PoseSuitability) || null,
      goalSuitability: (current.goalSuitability as GoalSuitability) || null,
      recommendationRelevance: (current.recommendationRelevance as RecommendationRelevance) || null,
      recommendationSupported: (current.recommendationSupported as Supported) || null,
      notes: current.notes || "",
      skipped: skip,
      annotatedAt: new Date().toISOString(),
      annotatorId,
    };
    const updated = [...annotations.filter(a => !(a.imageId === image.id && a.annotatorId === annotatorId)), annotation];
    setAnnotations(updated);
    saveAnnotations(updated);
    setCurrent({});
    setCurrentIndex(i => Math.min(i + 1, images.length - 1));
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(annotations, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `annotations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  if (!images.length) {
    return (
      <Container className="py-8">
        <h1 className="mb-2 text-xl font-bold text-white">Portrait Annotation</h1>
        <p className="mb-6 text-xs text-gray-500">Internal tool. Upload images to annotate. No public indexing.</p>
        <Card className="p-6">
          <p className="mb-4 text-sm text-gray-400">Upload approved test images (licensed, synthetic, or consented).</p>
          <label className="inline-block cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <Button size="sm">Upload Images</Button>
          </label>
        </Card>
      </Container>
    );
  }

  if (showReport) {
    const total = annotations.length;
    const skipped = annotations.filter(a => a.skipped).length;
    const byGoal = GOALS.map(g => ({ goal: g, count: annotations.filter(a => a.goal === g).length }));
    return (
      <Container className="py-8">
        <h1 className="mb-4 text-xl font-bold text-white">Annotation Report</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="p-3"><p className="text-xs text-gray-500">Total</p><p className="text-lg font-bold text-white">{total}</p></Card>
          <Card className="p-3"><p className="text-xs text-gray-500">Skipped</p><p className="text-lg font-bold text-yellow-400">{skipped}</p></Card>
          <Card className="p-3"><p className="text-xs text-gray-500">Annotated</p><p className="text-lg font-bold text-emerald-400">{total - skipped}</p></Card>
          <Card className="p-3"><p className="text-xs text-gray-500">Annotator</p><p className="text-[10px] font-mono text-gray-400">{annotatorId.slice(0, 16)}</p></Card>
        </div>
        <Card className="p-4 mb-4">
          <h3 className="mb-2 text-xs font-semibold text-white">By Goal</h3>
          {byGoal.map(g => <p key={g.goal} className="text-xs text-gray-400">{g.goal}: {g.count}</p>)}
        </Card>
        <Button size="sm" onClick={() => setShowReport(false)}>Back to Annotation</Button>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Annotate</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowReport(true)}>Report</Button>
          <Button size="sm" onClick={handleExport}>Export</Button>
        </div>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        Image {currentIndex + 1} of {images.length} · Goal: {image?.goal} · Annotator: {annotatorId.slice(0, 12)}
      </p>

      {image && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Image preview */}
          <Card className="p-2">
            <img src={image.src} alt={image.label} className="w-full rounded-lg object-contain" style={{ maxHeight: "60vh" }} />
            <p className="mt-2 text-[10px] text-gray-500">{image.label}</p>
          </Card>

          {/* Annotation form */}
          <div className="space-y-3">
            <SelectField label="Usability" value={current.usability} onChange={v => setCurrent(prev => ({ ...prev, usability: v as Usability }))} options={["good", "usable-with-limitations", "insufficient"]} />
            <SelectField label="Blur Severity" value={current.blurSeverity} onChange={v => setCurrent(prev => ({ ...prev, blurSeverity: v as BlurSeverity }))} options={["none", "mild", "moderate", "severe"]} />
            <SelectField label="Exposure" value={current.exposure} onChange={v => setCurrent(prev => ({ ...prev, exposure: v as Exposure }))} options={["normal", "underexposed", "overexposed", "severely-underexposed", "severely-overexposed"]} />
            <SelectField label="Face Visibility" value={current.faceVisibility} onChange={v => setCurrent(prev => ({ ...prev, faceVisibility: v as FaceVisibility }))} options={["clear", "partial", "occluded", "none"]} />
            <SelectField label="Subject Size" value={current.subjectSize} onChange={v => setCurrent(prev => ({ ...prev, subjectSize: v as SubjectSize }))} options={["large", "medium", "small", "tiny"]} />
            <SelectField label="Headroom" value={current.headroom} onChange={v => setCurrent(prev => ({ ...prev, headroom: v as Headroom }))} options={["good", "too-much", "too-little", "face-cut"]} />
            <SelectField label="Crop" value={current.crop} onChange={v => setCurrent(prev => ({ ...prev, crop: v as Crop }))} options={["good", "too-tight", "too-loose", "off-centre"]} />
            <SelectField label="Background Clutter" value={current.backgroundClutter} onChange={v => setCurrent(prev => ({ ...prev, backgroundClutter: v as BackgroundClutter }))} options={["clean", "mild", "moderate", "severe"]} />
            <SelectField label="Subject-Background Separation" value={current.separation} onChange={v => setCurrent(prev => ({ ...prev, separation: v as Separation }))} options={["strong", "adequate", "weak", "none"]} />
            <SelectField label="Pose Suitability" value={current.poseSuitability} onChange={v => setCurrent(prev => ({ ...prev, poseSuitability: v as PoseSuitability }))} options={["good", "acceptable", "unsuitable"]} />
            <SelectField label="Goal Suitability" value={current.goalSuitability} onChange={v => setCurrent(prev => ({ ...prev, goalSuitability: v as GoalSuitability }))} options={["good", "acceptable", "unsuitable"]} />
            <SelectField label="Recommendation Relevance" value={current.recommendationRelevance} onChange={v => setCurrent(prev => ({ ...prev, recommendationRelevance: v as RecommendationRelevance }))} options={["high", "medium", "low", "not-supported"]} />
            <SelectField label="Recommendation Supported by Evidence" value={current.recommendationSupported} onChange={v => setCurrent(prev => ({ ...prev, recommendationSupported: v as Supported }))} options={["yes", "partially", "no"]} />

            <div>
              <label className="mb-1 block text-xs text-gray-400">Notes (optional)</label>
              <textarea className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-xs text-white" rows={2} value={current.notes || ""} onChange={e => setCurrent(prev => ({ ...prev, notes: e.target.value }))} />
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

function SelectField({ label, value, onChange, options }: { label: string; value?: string | null; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      <select className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-xs text-white" value={value || ""} onChange={e => onChange(e.target.value)}>
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
