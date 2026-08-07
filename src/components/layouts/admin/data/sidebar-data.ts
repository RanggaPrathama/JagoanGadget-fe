import {
  LayoutDashboard,
  ListTodo,
  Package,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
// import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '@/types/sidebar'

export const sidebarData: SidebarData = {
  user: {
    name: 'rangga',
    email: 'rangga@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      children: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Category',
          url: '/category',
          icon: ListTodo,
        },
        {
          title: 'Products',
          url: '/products',
          icon: Package,
        },
      ],
    },
  ],
}
