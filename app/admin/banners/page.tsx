import { listarBannersAdmin } from "@/services/admin";
import { BannersBoard } from "@/components/admin/BannersBoard";

export default async function BannersPage() {
  const banners = await listarBannersAdmin().catch(() => []);
  return <BannersBoard banners={banners} />;
}
