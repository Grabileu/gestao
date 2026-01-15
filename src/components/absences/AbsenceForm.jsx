import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AbsenceForm({ onSubmit, isLoading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input placeholder="Motivo da ausência" required />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
