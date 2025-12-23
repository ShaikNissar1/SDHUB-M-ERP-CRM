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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  HomeIcon,
  UsersIcon,
  FileVolumeIcon as FileChartColumnIcon,
  CalendarCheck2Icon,
  AwardIcon,
  Settings2Icon,
  BellIcon,
  ClipboardListIcon,
  FolderIcon,
  LayersIcon,
  BookOpenIcon,
  PlusIcon,
  CheckSquare,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AddCourseDialog } from "@/components/courses/add-course-dialog"

export function AdminSidebar() {
  const pathname = usePathname()
  const items = [
    { href: "/", label: "Dashboard", icon: HomeIcon },
    { href: "/enquiries", label: "Enquiries", icon: UsersIcon, badge: { text: "3", variant: "default" as const } },
    { href: "/documents", label: "Student Records", icon: FolderIcon },
    { href: "/courses", label: "Courses", icon: BookOpenIcon },
    { href: "/batches", label: "Batches", icon: LayersIcon },
    { href: "/teachers", label: "Teachers", icon: FileChartColumnIcon },
    { href: "/attendance", label: "Attendance", icon: CalendarCheck2Icon },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/certificates", label: "Certificates", icon: AwardIcon },
    { href: "/reports", label: "Reports", icon: FileChartColumnIcon },
    { href: "/exam-master", label: "Exam Master", icon: ClipboardListIcon },
    { href: "/settings", label: "Settings", icon: Settings2Icon },
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
                  {item.badge && (
                    <Badge className="absolute right-2 top-1.5" variant="secondary">
                      {item.badge.text}
                    </Badge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Courses</SidebarGroupLabel>
          <SidebarGroupContent>
            <AddCourseDialog
              trigger={
                <Button className="w-full justify-start gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Add Course
                </Button>
              }
            />
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
