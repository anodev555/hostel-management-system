import {
  AudioLinesIcon,
  BotIcon,
  Building2,
  EyeIcon,
  FolderKanban,
  FrameIcon,
  GalleryVerticalEndIcon,
  MapIcon,
  PieChartIcon,
  PlusIcon,
  TerminalIcon,
} from "lucide-react";

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
      isActive: false,
      items: [
        {
          title: "Manage Hostels",
          icon: <FolderKanban />,
          url: "/admin/dashboard/hostels",
          isActive: false,
        },
      ],
    },
  ],
  Subscriptions: [
    {
      title: "Subscription",
      url: "#",
      icon: <Building2 />,
      isActive: false,
      items: [
        {
          title: "Manage Subscriptions",
          icon: <FolderKanban />,
          url: "/admin/dashboard/subscriptions",
          isActive: false,
        },
      ],
    },
  ],
};
