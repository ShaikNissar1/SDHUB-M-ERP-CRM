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
  BookOpenIcon,
  CalendarCheck2Icon,
  ClipboardCheckIcon,
  AwardIcon,
  Settings2Icon,
  BellIcon,
} from "lucide-react"
import Image from "next/image"

export function StudentSidebar() {
  const pathname = usePathname()
  const items = [
    { href: "/student", label: "Dashboard", icon: HomeIcon },
    { href: "/student/courses", label: "My Courses", icon: BookOpenIcon },
    { href: "/student/attendance", label: "Attendance", icon: CalendarCheck2Icon },
    { href: "/student/exams", label: "Exams", icon: ClipboardCheckIcon },
    { href: "/student/certificates", label: "Certificates", icon: AwardIcon },
    { href: "/student/settings", label: "Settings", icon: Settings2Icon },
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
