import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Layout for /upload: only accessible to users with admin role.
 * Redirects to login with callback to /upload if no session or user is not admin.
 */
export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    redirect("/login?callbackUrl=/upload");
  }
  if (!session?.user?.isAdmin) {
    redirect("/login?callbackUrl=/upload");
  }
  return <>{children}</>;
}
