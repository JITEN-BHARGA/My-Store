import { getCurrentUser } from "@/app/_lib/auth";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (user.role !== "customer") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}