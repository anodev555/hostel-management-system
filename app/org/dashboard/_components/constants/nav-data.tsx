import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  PlusIcon,
  UserKey,
  DoorOpen,
  User,
  Users,
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
      resource: "student",
      action: "create",
    },
  ],

  Staff: [
    {
      title: "Staff & Roles",
      url: "#",
      icon: <UserKey />,
      isActive: true,
      items: [
        {
          title: "Staff",
          url: "/org/dashboard/staff",
          icon: <UserKey />,
          resource: "staff",
          action: "read",
        },
        {
          title: "Roles",
          url: "/org/dashboard/roles",
          icon: <UserKey />,
          resource: "ac",
          action: "read",
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
          resource: "student",
          action: "read",
        },
        {
          title: "Room",
          url: "/org/dashboard/rooms",
          icon: <DoorOpen />,
          resource: "student",
          action: "read",
        },
        {
          title: "Tuition",
          url: "/org/dashboard/tuition",
          icon: <GraduationCap />,
          resource: "student",
          action: "read",
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
          resource: "billing",
          action: "read",
        },
        {
          title: "Payroll",
          url: "/org/dashboard/payroll",
          icon: <BanknoteArrowUp />,
          resource: "payroll",
          action: "read",
        },
      ],
    },
  ],
  Settings: [
    {
      title: "Settings",
      url: "#",
      icon: <WalletIcon />,
      isActive: false,
      items: [
        {
          title: "Profile",
          url: "/org/dashboard/setting",
          icon: <UserCheck />,
          resource: "organization",
          action: "read",
        },
        {
          title: "Lodging",
          url: "/org/dashboard/setting/lodging",
          icon: <BanknoteArrowUp />,
          resource: "lodging",
          action: "read",
        },
        {
          title: "Room",
          url: "/org/dashboard/setting/room",
          icon: <BanknoteArrowUp />,
          resource: "room",
          action: "read",
        },
        {
          title: "Fooding",
          url: "/org/dashboard/setting/fooding",
          icon: <BanknoteArrowUp />,
          resource: "fooding",
          action: "read",
        },
        {
          title: "Tuition",
          url: "/org/dashboard/setting/tuitionplan",
          icon: <BanknoteArrowUp />,
          resource: "tuition",
          action: "read",
        },
        {
          title: "Teacher",
          url: "/org/dashboard/setting/teacher",
          icon: <BanknoteArrowUp />,
          resource: "teacher",
          action: "read",
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
      resource: "expenses",
      action: "read",
    },
  ],
  Visitors: [
    {
      title: "Visitors",
      url: "/org/dashboard/visitors",
      icon: <Users />,
      isActive: true,
      resource: "visitor",
      action: "read",
    },
  ],
  Payroll: [
    {
      title: "Payroll",
      url: "/org/dashboard/payroll",
      icon: <BanknoteArrowUp />,
      isActive: true,
    },
  ],
};

export const orgNavGroups: OrgNavGroup[] = [
  {
    label: "New Admission",

    items: data.NewAdmission,
  },
  {
    label: "Students",

    items: data.Students,
  },
  {
    label: "Billing",

    items: data.Billings,
  },
  {
    label: "Access Control",

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

    items: data.Expenses,
  },
  {
    label: "Visitors",

    items: data.Visitors,
  },
  {
    label: "Setting",

    items: data.Settings,
  },
  // {
  //   label: "Payroll",
  //   resource: "payroll",
  //   action: "read",
  //   items: data.Payroll,
  // },
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
