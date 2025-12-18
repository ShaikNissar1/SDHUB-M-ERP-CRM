"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const classes = {
  mathsA: [
    { id: 1, name: "Asha Verma" },
    { id: 2, name: "Rohit Kumar" },
    { id: 3, name: "Sara Khan" },
  ],
  physicsB: [
    { id: 4, name: "Karan Singh" },
    { id: 5, name: "Ira Patel" },
    { id: 6, name: "Nikhil Rao" },
  ],
}

type MarkMap = Record<number, "present" | "absent" | undefined>

function ClassAttendance({ students }: { students: { id: number; name: string }[] }) {
  const [date, setDate] = React.useState<string>("2025-10-08")
  const [marks, setMarks] = React.useState<MarkMap>({})

  const presentCount = Object.values(marks).filter((m) => m === "present").length
  const total = students.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-[200px]" />
        <div className="ml-auto text-sm text-muted-foreground">
          Present: <span className="font-medium text-foreground">{presentCount}</span> / {total}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead className="w-[200px]">Mark</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={marks[s.id] === "present" ? "default" : "outline"}
                    onClick={() => setMarks((m) => ({ ...m, [s.id]: "present" }))}
                  >
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={marks[s.id] === "absent" ? "destructive" : "outline"}
                    onClick={() => setMarks((m) => ({ ...m, [s.id]: "absent" }))}
                  >
                    Absent
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button>Save (Local)</Button>
      </div>
    </div>
  )
}

export default function TeacherAttendanceMark() {
  return (
    <Tabs defaultValue="mathsA" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="mathsA">Maths - Batch A</TabsTrigger>
        <TabsTrigger value="physicsB">Physics - Batch B</TabsTrigger>
      </TabsList>
      <TabsContent value="mathsA">
        <ClassAttendance students={classes.mathsA} />
      </TabsContent>
      <TabsContent value="physicsB">
        <ClassAttendance students={classes.physicsB} />
      </TabsContent>
    </Tabs>
  )
}
