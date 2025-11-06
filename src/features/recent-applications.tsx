
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JobApplication } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from 'date-fns';


type RecentApplicationsProps = {
    applications: JobApplication[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
    if (applications.length === 0) {
        return (
            <div className="text-center p-8">
                <p className="text-muted-foreground">No applications tracked yet.</p>
                <Button asChild variant="link" className="mt-2">
                    <Link href="/applications">
                        Add your first application
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date Applied</TableHead>
                    <TableHead className="text-right">Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map(app => (
                        <TableRow key={app.id}>
                            <TableCell>
                                <div className="font-medium">{app.company}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge className="text-xs" variant="outline">{app.status}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{format(parseISO(app.dateApplied), 'PPP')}</TableCell>
                            <TableCell className="text-right">{app.role}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="text-center">
                <Button asChild variant="outline" size="sm">
                    <Link href="/applications">
                        View All Applications <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}

    