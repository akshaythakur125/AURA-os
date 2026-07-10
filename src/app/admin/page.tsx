import type { Metadata } from "next";
import AdminPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Admin — AuraCheck",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminPage />;
}
