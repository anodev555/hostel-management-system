import {
  AudioLinesIcon,
  BotIcon,
  Building2,
  EyeIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  MapIcon,
  PieChartIcon,
  PlusIcon,
  TerminalIcon,
} from "lucide-react"

export const data = {
  teams: [
    {
      name: "Admin",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],

  quickActions: [
    {
      title: "Create Hostel",
      url: "#",
      icon: <PlusIcon />,
    },
  ],
  Hostels: [
    {
      title: "Hostels",
      url: "#",
      icon: <Building2 />,
      isActive: true,
      items: [
        {
          title: "Create Hostel",
          icon: <PlusIcon />,
          url: "/admin/dashboard/hostels/create",
        },
        {
          title: "View Hostels",
          icon: <EyeIcon />,
          url: "/admin/dashboard/hostels",
        },
      ],
    },
  ],
}
