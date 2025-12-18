"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

type StudentRecord = {
  id: string
  name: string
}

export default function StudentDocuments({ student }: { student: StudentRecord }) {
  // Mock documents data - in a real app, this would come from the database
  const documents = [
    { id: 1, name: "Admission Certificate", type: "PDF", uploadedDate: "2024-01-10" },
    { id: 2, name: "Course Completion Certificate", type: "PDF", uploadedDate: "2024-01-15" },
    { id: 3, name: "Exam Score Report", type: "PDF", uploadedDate: "2024-01-20" },
  ]

  return (
    <div className="space-y-4">
      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">Uploaded: {doc.uploadedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{doc.type}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Documents Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All your important documents are stored here. You can download them anytime. For uploading new documents,
            please contact the admin.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
