import { lerSettingsAdmin } from "@/services/admin";
import { ConfiguracoesForm } from "@/components/admin/ConfiguracoesForm";

export default async function ConfiguracoesPage() {
  const settings = await lerSettingsAdmin();
  return <ConfiguracoesForm settings={settings} />;
}
