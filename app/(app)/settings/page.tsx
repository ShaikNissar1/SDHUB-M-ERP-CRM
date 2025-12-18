"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Settings2Icon,
  UsersIcon,
  BookOpenIcon,
  ClipboardListIcon,
  CalendarCheck2Icon,
  BarChart3Icon,
  BellIcon,
  UserIcon,
  SaveIcon,
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <main className="space-y-6">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-pretty">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your institute configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <SaveIcon className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-2">
          <TabsTrigger value="general" className="gap-2">
            <Settings2Icon className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <UsersIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpenIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="enquiries" className="gap-2">
            <ClipboardListIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Enquiries</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <CalendarCheck2Icon className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3Icon className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <BellIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
        </TabsList>

        {/* General Institute Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Institute Settings</CardTitle>
              <CardDescription>Control the overall identity and configuration of your system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Institute Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="instituteName">Institute Name</Label>
                  <Input id="instituteName" placeholder="e.g., SD HUB Academy" defaultValue="SD HUB" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" placeholder="e.g., Excellence in Education" />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contact@institute.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+91 XXXXXXXXXX" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Institute address" />
                </div>
              </div>

              {/* Website & Social Media */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="socialMedia">Social Media Links</Label>
                  <Input id="socialMedia" placeholder="Facebook, Twitter, LinkedIn URLs" />
                </div>
              </div>

              {/* Academic Settings */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="academicYear">Academic Year / Session</Label>
                  <Select defaultValue="2025-jan-mar">
                    <SelectTrigger id="academicYear">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-jan-mar">Jan - Mar 2025</SelectItem>
                      <SelectItem value="2025-apr-jun">Apr - Jun 2025</SelectItem>
                      <SelectItem value="2025-jul-sep">Jul - Sep 2025</SelectItem>
                      <SelectItem value="2025-oct-dec">Oct - Dec 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select defaultValue="ist">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                      <SelectItem value="utc">UTC (UTC+0:00)</SelectItem>
                      <SelectItem value="est">EST (UTC-5:00)</SelectItem>
                      <SelectItem value="pst">PST (UTC-8:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="theme">Primary Theme</Label>
                  <Select defaultValue="light">
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Select defaultValue="green">
                    <SelectTrigger id="accentColor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Holiday Calendar */}
              <div className="grid gap-2">
                <Label htmlFor="holidays">Holiday Calendar Management</Label>
                <Textarea
                  id="holidays"
                  placeholder="Add holidays (one per line, e.g., 2025-01-26 Republic Day)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Roles & Permissions */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Roles & Permissions</CardTitle>
              <CardDescription>Manage who can access what parts of the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">User Management</h3>
                  <Button size="sm">Add User</Button>
                </div>
                <div className="space-y-3">
                  {["Admin", "HR", "Teacher", "Student"].map((role) => (
                    <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{role}</span>
                      <Button size="sm" variant="outline">
                        Edit Permissions
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role-Based Permissions */}
              <div className="space-y-4">
                <h3 className="font-semibold">Role-Based Permissions</h3>
                <div className="space-y-3">
                  {[
                    { role: "Admin", permissions: ["View Dashboard", "Manage Users", "View Reports", "Edit Courses"] },
                    { role: "HR", permissions: ["Access Enquiries", "Manage Admissions", "View Reports"] },
                    { role: "Teacher", permissions: ["Access Attendance", "View Grades", "Mark Attendance"] },
                    { role: "Student", permissions: ["View Grades", "View Attendance", "View Certificates"] },
                  ].map((item) => (
                    <div key={item.role} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{item.role} Permissions</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {item.permissions.map((perm) => (
                          <div key={perm} className="flex items-center gap-2">
                            <Checkbox id={`${item.role}-${perm}`} defaultChecked />
                            <Label htmlFor={`${item.role}-${perm}`} className="text-sm cursor-pointer">
                              {perm}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Management */}
              <div className="space-y-3">
                <h3 className="font-semibold">Account Management</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Activate / Deactivate User Accounts</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Allow Password Reset</span>
                  <Switch defaultChecked />
                </div>
              </div>

              {/* Activity Logs */}
              <div className="space-y-3">
                <h3 className="font-semibold">Activity Logs</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Enable Login & Activity Logs</span>
                  <Switch defaultChecked />
                </div>
                <Button size="sm" variant="outline">
                  View Activity Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course & Batch Configurations */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course & Batch Configurations</CardTitle>
              <CardDescription>Define how new courses and batches behave</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="courseDuration">Default Course Duration</Label>
                  <Select defaultValue="3-months">
                    <SelectTrigger id="courseDuration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-month">1 Month</SelectItem>
                      <SelectItem value="3-months">3 Months</SelectItem>
                      <SelectItem value="6-months">6 Months</SelectItem>
                      <SelectItem value="1-year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="batchDuration">Default Batch Duration (days)</Label>
                  <Input id="batchDuration" type="number" placeholder="90" defaultValue="90" />
                </div>
              </div>

              {/* Batch Rules */}
              <div className="space-y-3">
                <h3 className="font-semibold">Batch Rules</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Auto-complete batches after end date</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Auto-assign default teachers per module</span>
                  <Switch defaultChecked />
                </div>
              </div>

              {/* Batch ID Format */}
              <div className="grid gap-2">
                <Label htmlFor="batchIdFormat">Batch ID Format / Naming Rule</Label>
                <Input id="batchIdFormat" placeholder="e.g., DM-2025Q1" defaultValue="DM-{YEAR}Q{QUARTER}" />
              </div>

              {/* Course Fee Templates */}
              <div className="space-y-3">
                <h3 className="font-semibold">Course Fee Templates</h3>
                <Textarea placeholder="Set fee structure or pricing rules (one per line)" rows={4} />
              </div>

              {/* Default Teachers */}
              <div className="space-y-3">
                <h3 className="font-semibold">Default Teachers per Module</h3>
                <Button size="sm" variant="outline">
                  Configure Module Teachers
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enquiry & Admission Settings */}
        <TabsContent value="enquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enquiry & Admission Settings</CardTitle>
              <CardDescription>Customize how enquiries and admissions are handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Follow-up Settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="followUpDuration">Default Follow-up Duration (days)</Label>
                  <Input id="followUpDuration" type="number" placeholder="3" defaultValue="3" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hrAssignment">Default HR Assignment</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger id="hrAssignment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto Assign</SelectItem>
                      <SelectItem value="manual">Manual Assign</SelectItem>
                      <SelectItem value="round-robin">Round Robin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Configuration */}
              <div className="space-y-3">
                <h3 className="font-semibold">Status Configuration</h3>
                <Textarea
                  placeholder="Define enquiry statuses (one per line, e.g., New, HR Called, Visited, Exam Written, Admitted, Rejected)"
                  rows={4}
                  defaultValue="New&#10;HR Called&#10;Visited&#10;Exam Written&#10;Admitted&#10;Rejected"
                />
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <h3 className="font-semibold">Notification Templates</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Email notifications after enquiry</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>SMS notifications after enquiry</span>
                  <Switch />
                </div>
              </div>

              {/* Entrance Exam */}
              <div className="grid gap-2">
                <Label htmlFor="entranceExamForm">Link Default Entrance Exam Google Form</Label>
                <Input id="entranceExamForm" placeholder="https://forms.gle/..." />
              </div>

              {/* Auto Reminders */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Enable Auto Reminders for Follow-ups</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Settings */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Settings</CardTitle>
              <CardDescription>Define how attendance tracking works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Working Days */}
              <div className="space-y-3">
                <h3 className="font-semibold">Working Days Setup</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <Checkbox id={`day-${day}`} defaultChecked={day !== "Sunday"} />
                      <Label htmlFor={`day-${day}`} className="text-sm cursor-pointer">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Rules */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="minAttendance">Minimum Attendance % Required</Label>
                  <Input id="minAttendance" type="number" placeholder="75" defaultValue="75" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="autoMarkAbsent">Auto Mark Absent After (minutes)</Label>
                  <Input id="autoMarkAbsent" type="number" placeholder="15" defaultValue="15" />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="font-semibold">Features</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Real-Time Attendance Calendar</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Biometric Integration</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Manual Entry Allowed</span>
                  <Switch defaultChecked />
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <h3 className="font-semibold">Report Export Options</h3>
                <div className="flex items-center gap-2">
                  <Checkbox id="export-pdf" defaultChecked />
                  <Label htmlFor="export-pdf" className="text-sm cursor-pointer">
                    PDF Export
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="export-excel" defaultChecked />
                  <Label htmlFor="export-excel" className="text-sm cursor-pointer">
                    Excel Export
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="export-csv" defaultChecked />
                  <Label htmlFor="export-csv" className="text-sm cursor-pointer">
                    CSV Export
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports & Dashboard Controls */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Dashboard Controls</CardTitle>
              <CardDescription>Adjust what's shown on dashboards and reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KPI Cards */}
              <div className="space-y-3">
                <h3 className="font-semibold">KPI Cards Control</h3>
                <div className="space-y-2">
                  {[
                    "Total Enquiries",
                    "Total Admissions",
                    "Active Courses",
                    "Total Students",
                    "Total Teachers",
                    "Attendance Rate",
                  ].map((kpi) => (
                    <div key={kpi} className="flex items-center gap-2">
                      <Checkbox id={`kpi-${kpi}`} defaultChecked />
                      <Label htmlFor={`kpi-${kpi}`} className="text-sm cursor-pointer">
                        {kpi}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard Widgets */}
              <div className="space-y-3">
                <h3 className="font-semibold">Dashboard Widgets</h3>
                <div className="space-y-2">
                  {[
                    "Enquiry Trends",
                    "Admission Pipeline",
                    "Course Performance",
                    "Attendance Overview",
                    "Revenue Chart",
                  ].map((widget) => (
                    <div key={widget} className="flex items-center gap-2">
                      <Checkbox id={`widget-${widget}`} defaultChecked />
                      <Label htmlFor={`widget-${widget}`} className="text-sm cursor-pointer">
                        {widget}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Export Defaults */}
              <div className="grid gap-2">
                <Label htmlFor="reportFormat">Default Report Export Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger id="reportFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto Email Reports */}
              <div className="space-y-3">
                <h3 className="font-semibold">Auto Email Reports</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Send Daily Reports</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Send Weekly Reports</span>
                  <Switch defaultChecked />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reportTime">Report Send Time</Label>
                  <Input id="reportTime" type="time" defaultValue="09:00" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications & Communication */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Communication</CardTitle>
              <CardDescription>Manage how system notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email SMTP */}
              <div className="space-y-3">
                <h3 className="font-semibold">Email SMTP Setup</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" placeholder="smtp.gmail.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" type="number" placeholder="587" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpEmail">Email Address</Label>
                    <Input id="smtpEmail" type="email" placeholder="noreply@institute.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input id="smtpPassword" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              {/* SMS Gateway */}
              <div className="space-y-3">
                <h3 className="font-semibold">SMS Gateway</h3>
                <div className="grid gap-2">
                  <Label htmlFor="smsProvider">SMS Provider</Label>
                  <Select defaultValue="msg91">
                    <SelectTrigger id="smsProvider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="msg91">MSG91</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws-sns">AWS SNS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smsApiKey">SMS API Key</Label>
                  <Input id="smsApiKey" type="password" placeholder="••••••••" />
                </div>
              </div>

              {/* WhatsApp Integration */}
              <div className="space-y-3">
                <h3 className="font-semibold">WhatsApp Integration (Optional)</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Enable WhatsApp Notifications</span>
                  <Switch />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsappApiKey">WhatsApp API Key</Label>
                  <Input id="whatsappApiKey" type="password" placeholder="••••••••" />
                </div>
              </div>

              {/* Notification Templates */}
              <div className="space-y-3">
                <h3 className="font-semibold">Default Notification Templates</h3>
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor="admissionTemplate">Admission Confirmation Template</Label>
                    <Textarea
                      id="admissionTemplate"
                      placeholder="Congratulations! You have been admitted to {course_name}..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resultTemplate">Exam Result Template</Label>
                    <Textarea
                      id="resultTemplate"
                      placeholder="Your exam result for {exam_name} is {score}..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile Settings</CardTitle>
              <CardDescription>Manage your personal admin preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="adminName">Full Name</Label>
                  <Input id="adminName" placeholder="Admin Name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input id="adminEmail" type="email" placeholder="admin@institute.com" />
                </div>
              </div>

              {/* Profile Picture */}
              <div className="grid gap-2">
                <Label htmlFor="profilePic">Profile Picture</Label>
                <Input id="profilePic" type="file" accept="image/*" />
              </div>

              {/* Password */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" />
                </div>
              </div>

              {/* Theme Preferences */}
              <div className="space-y-3">
                <h3 className="font-semibold">Theme Preferences</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="adminTheme">Theme Mode</Label>
                    <Select defaultValue="light">
                      <SelectTrigger id="adminTheme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sidebarPosition">Sidebar Position</Label>
                    <Select defaultValue="left">
                      <SelectTrigger id="sidebarPosition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-3">
                <h3 className="font-semibold">Notification Preferences</h3>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Email Notifications</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>SMS Notifications</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>In-App Notifications</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
