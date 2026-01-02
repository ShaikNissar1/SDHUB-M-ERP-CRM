"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createBrowserClient } from "@/lib/supabase/client"
import { useStudent } from "@/lib/contexts/student-context"
import { maskAadhaar, maskPAN } from "@/lib/utils/mask-sensitive-data"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Shield,
  Edit2,
  CheckCircle2,
  X,
  GraduationCap,
} from "lucide-react"
import { format, parseISO } from "date-fns"

interface StudentProfile {
  id: string
  name: string
  email: string
  phone: string
  alt_contact: string | null
  aadhaar_number: string | null
  pan_number: string | null
  dob: string | null
  gender: string | null
  address_permanent: string | null
  address_correspondence: string | null
  emergency_contact: string | null
  course_name: string
  batch_number: string
  join_date: string | null
  status: string
  qualification: string | null
  photo_url: string | null
}

export default function StudentProfilePage() {
  const { selectedStudent } = useStudent()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    email: "",
    phone: "",
    alt_contact: "",
    address_correspondence: "",
    emergency_contact: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedStudent) {
      fetchProfile()
    }
  }, [selectedStudent])

  async function fetchProfile() {
    if (!selectedStudent) return

    try {
      setLoading(true)
      const supabase = createBrowserClient()

      const { data } = await supabase.from("students").select("*").eq("id", selectedStudent.id).single()

      if (data) {
        setProfile(data)
        setEditData({
          email: data.email || "",
          phone: data.phone || "",
          alt_contact: data.alt_contact || "",
          address_correspondence: data.address_correspondence || "",
          emergency_contact: data.emergency_contact || "",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!profile) return

    setSaving(true)
    try {
      const supabase = createBrowserClient()

      const { error } = await supabase.from("students").update(editData).eq("id", profile.id)

      if (error) throw error

      await fetchProfile()
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (!selectedStudent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Student Selected</h2>
        <p className="text-muted-foreground">Please select a student from the dropdown above</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Profile Not Found</p>
        <p className="text-muted-foreground">Unable to load student profile</p>
      </div>
    )
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="flex flex-col gap-6 pb-8">
      <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1 text-balance">{profile.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4 w-4" />
                    {profile.course_name} • Batch {profile.batch_number}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={profile.status === "Active" ? "default" : "secondary"} className="shadow-sm">
                      {profile.status}
                    </Badge>
                    {profile.join_date && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Enrolled {format(parseISO(profile.join_date), "MMM yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Student ID</Label>
                <p className="font-mono text-sm font-medium bg-muted/50 px-3 py-2 rounded-md">{profile.id}</p>
              </div>

              {profile.dob && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</Label>
                  <p className="text-sm font-medium">{format(parseISO(profile.dob), "PPP")}</p>
                </div>
              )}

              {profile.gender && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Gender</Label>
                  <p className="text-sm font-medium">{profile.gender}</p>
                </div>
              )}

              {profile.qualification && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Qualification</Label>
                  <p className="text-sm font-medium">{profile.qualification}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-amber-200/50 dark:border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                Identity Documents
              </CardTitle>
              <CardDescription className="text-xs">Sensitive information is masked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  Aadhaar Number
                </Label>
                <p className="font-mono text-sm font-medium bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 rounded-md border border-amber-200/30 dark:border-amber-900/30">
                  {maskAadhaar(profile.aadhaar_number)}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">PAN Number</Label>
                <p className="font-mono text-sm font-medium bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 rounded-md border border-amber-200/30 dark:border-amber-900/30">
                  {maskPAN(profile.pan_number)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information - Editable */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  Contact Information
                </CardTitle>
                <CardDescription className="mt-1">Update your contact details</CardDescription>
              </div>
              {!isEditing ? (
                <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 bg-transparent"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-sm bg-muted/30 px-3 py-2.5 rounded-md font-medium">
                      {profile.email || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Primary Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-sm bg-muted/30 px-3 py-2.5 rounded-md font-medium">
                      {profile.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt_contact" className="text-sm font-medium">
                    Alternate Contact
                  </Label>
                  {isEditing ? (
                    <Input
                      id="alt_contact"
                      value={editData.alt_contact}
                      onChange={(e) => setEditData({ ...editData, alt_contact: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-sm bg-muted/30 px-3 py-2.5 rounded-md font-medium">
                      {profile.alt_contact || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Emergency Contact
                  </Label>
                  {isEditing ? (
                    <Input
                      id="emergency_contact"
                      value={editData.emergency_contact}
                      onChange={(e) => setEditData({ ...editData, emergency_contact: e.target.value })}
                      className="h-10"
                    />
                  ) : (
                    <p className="text-sm bg-muted/30 px-3 py-2.5 rounded-md font-medium">
                      {profile.emergency_contact || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center justify-between">
                  <span>Correspondence Address</span>
                  {isEditing && <span className="text-xs text-muted-foreground">Editable</span>}
                </Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    rows={3}
                    value={editData.address_correspondence}
                    onChange={(e) => setEditData({ ...editData, address_correspondence: e.target.value })}
                    placeholder="Enter your current address"
                    className="resize-none"
                  />
                ) : (
                  <p className="text-sm bg-muted/30 px-3 py-2.5 rounded-md whitespace-pre-wrap leading-relaxed">
                    {profile.address_correspondence || "Not provided"}
                  </p>
                )}
              </div>

              {profile.address_permanent && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center justify-between">
                      <span>Permanent Address</span>
                      <span className="text-xs text-muted-foreground">Read-only</span>
                    </Label>
                    <p className="text-sm bg-muted/30 px-3 py-2.5 rounded-md whitespace-pre-wrap leading-relaxed border border-dashed">
                      {profile.address_permanent}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-200/50 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Academic Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Course</Label>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">{profile.course_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Batch</Label>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">{profile.batch_number}</p>
                </div>
                {profile.join_date && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Enrollment Date</Label>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      {format(parseISO(profile.join_date), "dd MMM yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
