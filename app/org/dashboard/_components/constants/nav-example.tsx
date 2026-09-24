import {
  AudioLinesIcon,
  BikeIcon,
  BookOpenIcon,
  BotIcon,
  CarIcon,
  FilePieChartIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  ImageDown,
  LayoutDashboardIcon,
  MailIcon,
  MapIcon,
  MessageSquareIcon,
  PieChartIcon,
  Settings2Icon,
  StarIcon,
  TerminalIcon,
  TerminalSquareIcon,
} from "lucide-react"
import { url } from "node:inspector"

export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  Dashboard: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: <LayoutDashboardIcon />,
    },
  ],

  AdsPopup: [
    {
      title: "Ads Popup",
      url: "/admin/ads-popup",
      icon: <ImageDown />,
    },
  ],

  Newsletter: [
    {
      title: "Newsletter",
      url: "#",
      icon: <MailIcon />,
      items: [
        {
          title: "Newsletter",
          url: "/admin/newsletter",
        },
        {
          title: "History & Status",
          url: "/admin/newsletter/history-status",
        }, 
      ],
    },
  ],

  Reviews: [
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: <StarIcon />,
    },
  ],
  Enquiries: [
    {
      title: "Enquiries",
      url: "/admin/enquiries",
      icon: <MessageSquareIcon />,
    },
  ],

  NewsManagement: [
    {
      title: "News Management",
      url: "#",
      icon: <TerminalSquareIcon />,
      items: [
        {
          title: "News Type",
          url: "/admin/news-type",
        },
        {
          title: "News Management",
          url: "/admin/news",
        },
      ],
    },
  ],
  VehicleManagement: [
    {
      title: "Vechicle Management",
      url: "#",
      icon: <CarIcon />,
      items: [
        {
          title: " Add Brand",
          url: "/admin/add-brand",
        },
        {
          title: "Vehicle Management",
          url: "/admin/vehicle-management",
        },
        {
          title: "All Variants",
          url: "/admin/all-variants",
        },
      ],
    },
  ],
  AdsManagement: [
    {
      title: "Ads Management",
      url: "#",
      icon: <ImageDown />,
      items: [
        {
          title: "Ads Management",
          url: "/admin/ads-management",
        },
      ],
    },
  ],
  Settings: [
    {
      title: "Setting",
      url: "/admin/setting",
      icon: <Settings2Icon />,
    },
  ],
}