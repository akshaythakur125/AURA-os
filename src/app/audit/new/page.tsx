import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function NewAuditPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="New Aura Check"
        subtitle="Upload a photo or select an audit type to begin."
      />
      <Card className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5">
          <svg
            className="h-10 w-10 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="mb-1 text-lg text-gray-300">Image upload coming soon</p>
        <p className="mb-6 text-sm text-gray-500">
          You will be able to upload photos for AI-style analysis here.
        </p>
        <Button disabled>Select Photo</Button>
      </Card>
    </Container>
  );
}
