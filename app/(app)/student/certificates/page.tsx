"use client"

import CertificatesList from "@/components/student/certificates-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentCertificatesPage() {
  return (
    <main className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Certificates</h1>
        <p className="text-muted-foreground">View and download your certificates when they are ready.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Status</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificatesList />
        </CardContent>
      </Card>
    </main>
  )
}
