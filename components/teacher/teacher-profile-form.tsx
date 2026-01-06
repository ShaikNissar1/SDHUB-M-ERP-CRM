"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, User } from "lucide-react"

interface TeacherProfile {
  name: string
  email: string
  phone: string
  specialization: string
  employeeId: string
  department: string
  joinDate: string
}

interface TeacherProfileFormProps {
  profile: TeacherProfile
}

export default function TeacherProfileForm({ profile }: TeacherProfileFormProps) {
  const [formData, setFormData] = useState({
    email: profile.email,
    phone: profile.phone,
    specialization: profile.specialization,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = () => {
    console.log("Saving profile:", formData)
    // UI only - no actual save logic
  }

  const hasChanges = (
    formData.email !== profile.email ||
    formData.phone !== profile.phone ||
    formData.specialization !== profile.specialization
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your contact information and specialization
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name - Read Only */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={profile.name}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Contact administration to change your name
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Textarea
            id="specialization"
            value={formData.specialization}
            onChange={(e) => handleInputChange("specialization", e.target.value)}
            placeholder="Enter your areas of specialization"
            className="min-h-20"
          />
          <p className="text-xs text-muted-foreground">
            List your subjects and areas of expertise
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSaveProfile}
            disabled={!hasChanges}
            className="w-full gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}