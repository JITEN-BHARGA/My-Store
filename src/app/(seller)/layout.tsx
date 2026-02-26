import { getCurrentUser } from "@/app/_lib/auth";
import { redirect } from "next/navigation";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (user.role !== "seller") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}