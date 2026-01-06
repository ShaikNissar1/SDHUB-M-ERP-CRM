"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface CreateAssignmentDialogProps {
    onSubmit?: (assignment: {
        title: string
        description: string
        batchId: string
        dueDate: string
    }) => void
}

export function CreateAssignmentDialog({ onSubmit }: CreateAssignmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [batchId, setBatchId] = useState("")
    const [dueDate, setDueDate] = useState("")

    // Mock batch data - replace with actual data fetching
    const batches = [
        { id: "batch-1", name: "CS-2024-A", course: "Computer Science Fundamentals" },
        { id: "batch-2", name: "CS-2024-B", course: "Data Structures & Algorithms" },
        { id: "batch-3", name: "CS-2024-C", course: "Web Development" },
        { id: "batch-4", name: "CS-2024-D", course: "Database Management" },
    ]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSubmit) {
            onSubmit({ title, description, batchId, dueDate })
        }
        // Reset form
        setTitle("")
        setDescription("")
        setBatchId("")
        setDueDate("")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Assignment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Assignment Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter assignment title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter assignment description and instructions"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="batch">Select Batch</Label>
                        <Select value={batchId} onValueChange={setBatchId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                        {batch.name} - {batch.course}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Assignment</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}