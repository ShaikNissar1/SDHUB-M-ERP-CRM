"use client"

import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BellIcon, MoreVerticalIcon, User2Icon, LogOutIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddCourseDialog } from "@/components/courses/add-course-dialog"
import { AddBatchDialog } from "@/components/batches/add-batch-dialog"
import { useCourses } from "@/lib/courses"
import { RoleSelector } from "@/components/role-selector"
import { saveUserRole, loadUserRole } from "@/lib/user-role"
import { useRouter } from "next/navigation"

export function TopNav() {
  const [notifCount] = useState(2)
  const [openLead, setOpenLead] = useState(false)
  const [openCourse, setOpenCourse] = useState(false)
  const [openBatch, setOpenBatch] = useState(false)
  const courses = useCourses()
  const router = useRouter()

  const handleStudentDashboard = () => {
    const user = loadUserRole()
    saveUserRole({
      ...user,
      role: "student",
    })
    router.push("/student")
  }

  const handleTeacherDashboard = () => {
    const user = loadUserRole()
    saveUserRole({
      ...user,
      role: "teacher",
    })
    router.push("/teacher")
  }

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-3 px-4 md:px-6 h-14">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-1 h-6" />
        <div className="relative hidden md:block w-[360px]">
          <Input placeholder="Search students, leads, courses…" className="pl-3" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <RoleSelector />

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md h-9 w-9 inline-flex items-center justify-center hover:bg-accent">
              <MoreVerticalIcon className="h-5 w-5" />
              <span className="sr-only">Quick actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setOpenLead(true)}>New Lead</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenCourse(true)}>Add Course</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenBatch(true)}>Add Batch</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="relative rounded-full h-9 w-9 inline-flex items-center justify-center hover:bg-accent">
            <BellIcon className="h-5 w-5" />
            {notifCount > 0 && (
              <span
                aria-label={`${notifCount} new notifications`}
                className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-[10px] leading-none px-1"
              >
                {notifCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Image src="/placeholder-user.jpg" alt="Profile" width={32} height={32} className="rounded-full" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
              <div className="px-2 pb-2 text-sm text-muted-foreground truncate">admin@sdhub.example</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User2Icon className="mr-2 h-4 w-4" />
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStudentDashboard}>
                <User2Icon className="mr-2 h-4 w-4" />
                Student Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTeacherDashboard}>
                <User2Icon className="mr-2 h-4 w-4" />
                Teacher Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={openLead} onOpenChange={setOpenLead}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Full Name" />
            <Input placeholder="Email" />
            <Input placeholder="Phone" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Course Interested" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenLead(false)}>Add</Button>
            <Button variant="outline" onClick={() => setOpenLead(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCourseDialog
        open={openCourse}
        onOpenChange={setOpenCourse}
        trigger={<span aria-hidden="true" className="hidden" />}
      />
      <AddBatchDialog
        open={openBatch}
        onOpenChange={setOpenBatch}
        trigger={<span aria-hidden="true" className="hidden" />}
      />
    </header>
  )
}
