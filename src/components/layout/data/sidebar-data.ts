import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconTruck,
  IconUserCog,
  IconUserOff,
  IconUsers,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'
import { useAuthStore } from "@/stores/authStore"; // Import your authStore



export const getSidebarData = (): SidebarData => {
  const { user } = useAuthStore.getState().auth; // Dynamically fetch user data from the store
  return {
    user: {
      name: user?.name || "Guest", // Derive username from phoneNumber or fallback
      phoneNumber: user?.phoneNumber || "N/A",
      image: "/avatars/default-avatar.jpg", // Default avatar if not set
      role: "/avatars/default-avatar.jpg",
    },
    teams: [
      {
        name: 'Delivery Admin',
        logo: Command,
        plan: 'Hello',
      }
    ],
    navGroups: [
      {
        title: 'General',
        items: [
          {
            title: 'Dashboard',
            url: '/',
            icon: IconLayoutDashboard,
          },
          {
            title: 'Packages',
            url: '/packages',
            icon: IconChecklist,
          },
          {
            title: 'Delivery Persons',
            url: '/delivery-persons',
            icon: IconTruck,
          },
          {
            title: 'Apps',
            url: '/apps',
            icon: IconPackages,
          },
          {
            title: 'Chats',
            url: '/chats',
            badge: '3',
            icon: IconMessages,
          },
          {
            title: 'Users',
            url: '/users',
            icon: IconUsers,
          },
        ],
      },
      {
        title: 'Pages',
        items: [
          {
            title: 'Auth',
            icon: IconLockAccess,
            items: [
              {
                title: 'Sign In',
                url: '/sign-in',
              },
              {
                title: 'Sign In (2 Col)',
                url: '/sign-in-2',
              },
              {
                title: 'Sign Up',
                url: '/sign-up',
              },
              {
                title: 'Forgot Password',
                url: '/forgot-password',
              },
              {
                title: 'OTP',
                url: '/otp',
              },
            ],
          },
          {
            title: 'Errors',
            icon: IconBug,
            items: [
              {
                title: 'Unauthorized',
                url: '/401',
                icon: IconLock,
              },
              {
                title: 'Forbidden',
                url: '/403',
                icon: IconUserOff,
              },
              {
                title: 'Not Found',
                url: '/404',
                icon: IconError404,
              },
              {
                title: 'Internal Server Error',
                url: '/500',
                icon: IconServerOff,
              },
              {
                title: 'Maintenance Error',
                url: '/503',
                icon: IconBarrierBlock,
              },
            ],
          },
        ],
      },
      {
        title: 'Other',
        items: [
          {
            title: 'Settings',
            icon: IconSettings,
            items: [
              {
                title: 'Profile',
                url: '/settings',
                icon: IconUserCog,
              },
              {
                title: 'Account',
                url: '/settings/account',
                icon: IconTool,
              },
              {
                title: 'Appearance',
                url: '/settings/appearance',
                icon: IconPalette,
              },
              {
                title: 'Notifications',
                url: '/settings/notifications',
                icon: IconNotification,
              },
              {
                title: 'Display',
                url: '/settings/display',
                icon: IconBrowserCheck,
              },
            ],
          },
          {
            title: 'Help Center',
            url: '/help-center',
            icon: IconHelp,
          },
        ],
      },
    ],
  }
}

// export const sidebarData: SidebarData = {
//   user: {
//     name: 'satnaing',
//     phoneNumber: 'satnaingdev@gmail.com',
//     avatar: '/avatars/shadcn.jpg',
//   },
//   teams: [
//     {
//       name: 'Shadcn Admin',
//       logo: Command,
//       plan: 'Vite + ShadcnUI',
//     },
//     {
//       name: 'Acme Inc',
//       logo: GalleryVerticalEnd,
//       plan: 'Enterprise',
//     },
//     {
//       name: 'Acme Corp.',
//       logo: AudioWaveform,
//       plan: 'Startup',
//     },
//   ],
//   navGroups: [
//     {
//       title: 'General',
//       items: [
//         {
//           title: 'Dashboard',
//           url: '/',
//           icon: IconLayoutDashboard,
//         },
//         {
//           title: 'Packages',
//           url: '/packages',
//           icon: IconChecklist,
//         },
//         {
//           title: 'Apps',
//           url: '/apps',
//           icon: IconPackages,
//         },
//         {
//           title: 'Chats',
//           url: '/chats',
//           badge: '3',
//           icon: IconMessages,
//         },
//         {
//           title: 'Users',
//           url: '/users',
//           icon: IconUsers,
//         },
//       ],
//     },
//     {
//       title: 'Pages',
//       items: [
//         {
//           title: 'Auth',
//           icon: IconLockAccess,
//           items: [
//             {
//               title: 'Sign In',
//               url: '/sign-in',
//             },
//             {
//               title: 'Sign In (2 Col)',
//               url: '/sign-in-2',
//             },
//             {
//               title: 'Sign Up',
//               url: '/sign-up',
//             },
//             {
//               title: 'Forgot Password',
//               url: '/forgot-password',
//             },
//             {
//               title: 'OTP',
//               url: '/otp',
//             },
//           ],
//         },
//         {
//           title: 'Errors',
//           icon: IconBug,
//           items: [
//             {
//               title: 'Unauthorized',
//               url: '/401',
//               icon: IconLock,
//             },
//             {
//               title: 'Forbidden',
//               url: '/403',
//               icon: IconUserOff,
//             },
//             {
//               title: 'Not Found',
//               url: '/404',
//               icon: IconError404,
//             },
//             {
//               title: 'Internal Server Error',
//               url: '/500',
//               icon: IconServerOff,
//             },
//             {
//               title: 'Maintenance Error',
//               url: '/503',
//               icon: IconBarrierBlock,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       title: 'Other',
//       items: [
//         {
//           title: 'Settings',
//           icon: IconSettings,
//           items: [
//             {
//               title: 'Profile',
//               url: '/settings',
//               icon: IconUserCog,
//             },
//             {
//               title: 'Account',
//               url: '/settings/account',
//               icon: IconTool,
//             },
//             {
//               title: 'Appearance',
//               url: '/settings/appearance',
//               icon: IconPalette,
//             },
//             {
//               title: 'Notifications',
//               url: '/settings/notifications',
//               icon: IconNotification,
//             },
//             {
//               title: 'Display',
//               url: '/settings/display',
//               icon: IconBrowserCheck,
//             },
//           ],
//         },
//         {
//           title: 'Help Center',
//           url: '/help-center',
//           icon: IconHelp,
//         },
//       ],
//     },
//   ],
// }
