"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  HomeIcon,
  LayersIcon,
  CalendarCheck2Icon,
  TrendingUpIcon,
  FileTextIcon,
  Settings2Icon,
  BellIcon,
} from "lucide-react"
import Image from "next/image"

export function TeacherSidebar() {
  const pathname = usePathname()
  const items = [
    { href: "/teacher", label: "Dashboard", icon: HomeIcon },
    { href: "/teacher/batches", label: "My Batches", icon: LayersIcon },
    { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck2Icon },
    { href: "/teacher/performance", label: "Student Performance", icon: TrendingUpIcon },
    { href: "/teacher/assignments", label: "Assignments", icon: FileTextIcon },
    { href: "/teacher/settings", label: "Settings", icon: Settings2Icon },
  ]

  return (
    <>
      <SidebarHeader className="pt-3">
        <div className="flex items-center gap-2 px-2">
          <Image
            src="/assets/sd-hub-logo.png"
            width={120}
            height={40}
            alt="SD HUB - Skills Development Hub"
            className="h-auto w-32"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="block">
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 text-xs text-muted-foreground flex items-center gap-2">
          <BellIcon className="h-4 w-4" />
          Notifications enabled
        </div>
      </SidebarFooter>
    </>
  )
}
