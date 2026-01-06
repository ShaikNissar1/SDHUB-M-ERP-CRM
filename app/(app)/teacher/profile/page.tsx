"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, BookOpen, Lock, LogOut, Save } from "lucide-react"
import TeacherProfileForm from "@/components/teacher/teacher-profile-form"
import TeacherSettingsForm from "@/components/teacher/teacher-settings-form"

interface TeacherProfile {
  name: string
  email: string
  phone: string
  specialization: string
  employeeId: string
  department: string
  joinDate: string
}

export default function TeacherProfilePage() {
  // Mock teacher profile data
  const [profile] = useState<TeacherProfile>({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    phone: "+1 (555) 123-4567",
    specialization: "Computer Science, Data Structures, Algorithms",
    employeeId: "TCH001",
    department: "Computer Science",
    joinDate: "2022-08-15",
  })

  const handleLogout = () => {
    console.log("Logging out teacher...")
    // UI only - no actual logout logic
  }

  return (
    <main className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile information and account settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-xl">{profile.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile.employeeId}</p>
            <Badge variant="secondary" className="mt-2">
              {profile.department}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{profile.specialization}</span>
            </div>
            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground">
              <p>Joined: {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Form */}
        <div className="md:col-span-2 space-y-6">
          <TeacherProfileForm profile={profile} />

          <TeacherSettingsForm onLogout={handleLogout} />
        </div>
      </div>
    </main>
  )
}