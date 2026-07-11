import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Order History — AuraCheck",
  description: "View your purchases and payment history.",
};

export default function Page() {
  return <ClientPage />;
}
