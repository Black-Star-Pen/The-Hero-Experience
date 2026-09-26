import type { ServiceSlug } from "@hero-experience/shared";
import type { IconType } from "react-icons";
import { BsBoxSeam } from "react-icons/bs";
import { FaTheaterMasks } from "react-icons/fa";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { LuPartyPopper } from "react-icons/lu";
import {
  PiDetectiveBold,
  PiMusicNoteFill,
  PiStudentBold,
} from "react-icons/pi";
import { TbBallFootball } from "react-icons/tb";

/** Same icons as the original icon bar of the project. */
const ICONS: Record<ServiceSlug, IconType> = {
  demenagement: BsBoxSeam,
  sport: TbBallFootball,
  "aide-aux-devoirs": PiStudentBold,
  travaux: HiOutlineWrenchScrewdriver,
  evenements: LuPartyPopper,
  spectacle: FaTheaterMasks,
  enquetes: PiDetectiveBold,
  musique: PiMusicNoteFill,
};

export function ServiceIcon({
  slug,
  className,
}: {
  slug: ServiceSlug;
  className?: string;
}) {
  const Icon = ICONS[slug];
  return <Icon className={className} aria-hidden="true" />;
}
