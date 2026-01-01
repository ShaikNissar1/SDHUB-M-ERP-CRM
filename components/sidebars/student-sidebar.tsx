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
  UserIcon,
  CalendarCheck2Icon,
  ListTodoIcon,
  TrendingUpIcon,
  BookOpenIcon,
  AwardIcon,
  Settings2Icon,
} from "lucide-react"
import Image from "next/image"

export function StudentSidebar() {
  const pathname = usePathname()

  const items = [
    { href: "/student", label: "Dashboard", icon: HomeIcon },
    { href: "/student/profile", label: "My Profile", icon: UserIcon },
    { href: "/student/attendance", label: "My Attendance", icon: CalendarCheck2Icon },
    { href: "/student/tasks", label: "My Tasks", icon: ListTodoIcon },
    { href: "/student/performance", label: "My Performance", icon: TrendingUpIcon },
    { href: "/student/courses", label: "My Course", icon: BookOpenIcon },
    { href: "/student/certificates", label: "My Certificates", icon: AwardIcon },
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
          <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
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
        <div className="px-2 text-xs text-muted-foreground">Student Panel v1.0</div>
      </SidebarFooter>
    </>
  )
}
