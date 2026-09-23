import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  PlusIcon,
  UserKey,
  DoorOpen,
  User,
  WalletIcon,
  GraduationCap,
  BanknoteArrowDown,
  UserCheck,
  BanknoteArrowUp,
} from "lucide-react";

export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
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

  NewAdmission: [
    {
      title: "New Admission",
      url: "/org/dashboard/new-admission",
      icon: <PlusIcon />,
      isActive: true,
    },
  ],

  Rooms: [
    {
      title: "Rooms",
      url: "/org/dashboard/rooms",
      icon: <DoorOpen />,
      isActive: true,
    },
  ],

  roles: [
    {
      title: "Roles",
      url: "/org/dashboard/roles",
      icon: <UserKey />,
      isActive: true,
    },
  ],
  staff: [
    {
      title: "Staff",
      url: "/org/dashboard/staff",
      icon: <UserKey />,
      isActive: true,
    },
  ],
  Students: [
    {
      title: "Students",
      url: "/org/dashboard/students",
      icon: <User />,
      isActive: true,
    },
  ],
  // Billing: [
  //   {
  //     title: "Billing",
  //     url: "/org/dashboard/billing",
  //     icon: <WalletIcon />,
  //     isActive: true,
  //   },
  // ],
  Billings: [
    {
      title: "Billings",
      url: "#",
      icon: <WalletIcon />,
      isActive: false,
      items: [
        {
          title: "Student Billing",
          url: "/org/dashboard/billing",
          icon: <UserCheck />,
        },
        {
          title: "Payroll",
          url: "#",
          icon: <BanknoteArrowUp />,
        },
      ],
    },
  ],
  Tuition: [
    {
      title: "Tuition",
      url: "/org/dashboard/tuition",
      icon: <GraduationCap />,
      isActive: true,
    },
  ],
  Expenses: [
    {
      title: "Expenses",
      url: "/org/dashboard/expenses",
      icon: <BanknoteArrowDown />,
      isActive: true,
    },
  ],
};
