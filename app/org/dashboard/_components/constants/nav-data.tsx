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
import type { OrgNavGroup } from "../nav-types";

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

  // Rooms: [
  //   {
  //     title: "Rooms",
  //     url: "/org/dashboard/rooms",
  //     icon: <DoorOpen />,
  //     isActive: true,
  //   },
  // ],

  // roles: [
  //   {
  //     title: "Roles",
  //     url: "/org/dashboard/roles",
  //     icon: <UserKey />,
  //     isActive: true,
  //   },
  // ],
  // staff: [
  //   {
  //     title: "Staff",
  //     url: "/org/dashboard/staff",
  //     icon: <UserKey />,
  //     isActive: true,
  //   },
  // ],
  Staff: [
    {
      title: "Staff",
      url: "#",
      icon: <UserKey />,
      items: [
        {
          title: "Staff",
          url: "/org/dashboard/staff",
          icon: <UserKey />,
        },
        {
          title: "Roles",
          url: "/org/dashboard/roles",
          icon: <UserKey />,
        },
      ],
    },
  ],
  Students: [
    {
      title: "Students",
      url: "/org/dashboard/students",
      icon: <User />,
      isActive: true,
      items: [
        {
          title: "Student",
          url: "/org/dashboard/students",
          icon: <User />,
        },
        {
          title: "Room",
          url: "/org/dashboard/rooms",
          icon: <DoorOpen />,
        },
        {
          title: "Tuition",
          url: "/org/dashboard/tuition",
          icon: <GraduationCap />,
        },
      ],
    },
  ],

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

export const orgNavGroups: OrgNavGroup[] = [
  {
    label: "New Admission",
    resource: "student",
    action: "create",
    items: data.NewAdmission,
  },
  {
    label: "Students",
    resource: "student",
    action: "read",
    items: data.Students,
  },
  {
    label: "Billing",
    resource: "billing",
    action: "read",
    items: data.Billings,
  },
  {
    label: "Staff",
    resource: "staff",
    action: "read",
    items: data.Staff,
  },
  // {
  //   label: "Tuition",
  //   resource: "tuition",
  //   action: "read",
  //   items: data.Tuition,
  // },
  // {
  //   label: "Rooms",
  //   resource: "room",
  //   action: "read",
  //   items: data.Rooms,
  // },
  {
    label: "Expenses",
    resource: "expenses",
    action: "read",
    items: data.Expenses,
  },
  // {
  //   label: "Roles",
  //   resource: "ac",
  //   action: "read",
  //   items: data.roles,
  // },
  // {
  //   label: "Staff",
  //   resource: "staff",
  //   action: "read",
  //   items: data.Staff,
  // },
];
