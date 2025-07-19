import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useAppStore } from "../store";

export function LegislatureToggle() {
  const { legislatureLevel, setLegislatureLevel } = useAppStore();

  const handleToggle = (checked: boolean) => {
    setLegislatureLevel(checked ? 'state' : 'federal');
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="legislature-toggle" className="text-sm font-medium">
        Federal
      </Label>
      <Switch
        id="legislature-toggle"
        checked={legislatureLevel === 'state'}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="legislature-toggle" className="text-sm font-medium">
        State
      </Label>
    </div>
  );
}