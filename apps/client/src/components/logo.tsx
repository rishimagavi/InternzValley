import { useTheme } from "@reactive-resume/hooks";
import { cn } from "@reactive-resume/utils";

type Props = {
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className }: Props) => {
  const { isDarkMode } = useTheme();

  let src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  switch (isDarkMode) {
    case false: {
      src = "/logo/dark_svg.svg";
      break;
    }
    case true: {
      src = "/logo/light_svg.svg";
      break;
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={src}
        width={size}
        height={size}
        alt="InternzValley Resume Builder"
        className="rounded-sm"
      />
    </div>
  );
};
