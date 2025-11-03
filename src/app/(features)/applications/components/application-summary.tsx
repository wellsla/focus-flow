
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobApplication } from '@/lib/types';
import { Briefcase, Target, TrendingUp } from 'lucide-react';

type ApplicationSummaryProps = {
    applications: JobApplication[];
}

export function ApplicationSummary({ applications }: ApplicationSummaryProps) {
    const totalApplications = applications.length;
    const interviewingCount = applications.filter(app => app.status === 'Interviewing' || app.status === 'Offer').length;
    const activeCount = applications.filter(app => app.status !== 'Rejected' && app.status !== 'Wishlist').length;
    
    const interviewRate = totalApplications > 0 ? (interviewingCount / totalApplications) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalApplications}</div>
                    <p className="text-xs text-muted-foreground">The grind never stops.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{interviewRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">From applications to interviews.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeCount}</div>
                    <p className="text-xs text-muted-foreground">Currently in the running.</p>
                </CardContent>
            </Card>
        </div>
    )
}
