import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function AuditLoading() {
  return (
    <Container className="py-16">
      <Card className="mx-auto max-w-2xl py-12 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
        <p className="text-sm text-[#857b6e]">Loading audit report...</p>
      </Card>
    </Container>
  );
}
