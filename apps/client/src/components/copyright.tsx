import { t } from "@lingui/macro";
import { cn } from "@reactive-resume/utils";

type Props = {
  className?: string;
};

export const Copyright = ({ className }: Props) => (
  <div className={cn("space-y-2", className)}>
    <div className="text-xs">
      Licensed under <a href="/license">MIT</a>
      <br />
      By InternzValley, for the community.
    </div>

    <div className="text-xs opacity-75">
      InternzValley Resume Builder v1.0.0
    </div>
  </div>
);
