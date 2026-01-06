"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, LogOut, Eye, EyeOff } from "lucide-react"

interface TeacherSettingsFormProps {
  onLogout: () => void
}

export default function TeacherSettingsForm({ onLogout }: TeacherSettingsFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      console.log("Passwords don't match")
      return
    }

    console.log("Changing password...")
    // Reset form
    setPasswordData({
      current: "",
      new: "",
      confirm: "",
    })
  }

  const isPasswordFormValid = (
    passwordData.current.trim() &&
    passwordData.new.trim() &&
    passwordData.confirm.trim() &&
    passwordData.new === passwordData.confirm &&
    passwordData.new.length >= 8
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your password and account preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Change Password</h3>

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.current}
                onChange={(e) => handlePasswordChange("current", e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirm}
                onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {passwordData.new && passwordData.confirm && passwordData.new !== passwordData.confirm && (
              <p className="text-xs text-destructive">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Change Password Button */}
          <Button
            onClick={handleChangePassword}
            disabled={!isPasswordFormValid}
            className="w-full gap-2"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        </div>

        {/* Logout Section */}
        <div className="pt-6 border-t">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>

            <Button
              onClick={onLogout}
              variant="destructive"
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}