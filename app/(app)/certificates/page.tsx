"use client"

import { CertificatesTable } from "@/components/tables/certificates-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CertificatesPage() {
  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificatesTable />
        </CardContent>
      </Card>
    </main>
  )
}
