import { listarPedidosAdmin, migrationPendente } from "@/services/admin";
import type { CustomRequest } from "@/types";
import { PedidosBoard } from "@/components/admin/PedidosBoard";
import { AvisoCarga } from "@/components/admin/AvisoCarga";

export default async function PersonalizadosPage() {
  let pedidos: CustomRequest[] | null = null;
  let falha: unknown = null;

  try {
    pedidos = await listarPedidosAdmin();
  } catch (erro) {
    falha = erro;
  }

  if (!pedidos) {
    return (
      <AvisoCarga
        titulo="Peças personalizadas"
        migracao={migrationPendente(falha)}
        arquivo="supabase/migrations/0003_personalizados.sql"
      />
    );
  }

  return <PedidosBoard pedidos={pedidos} />;
}
