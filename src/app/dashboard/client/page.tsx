'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Session, TIER_CONFIG } from '@/types/database';
import { getStatusColor, getStatusLabel, formatDate, formatCents } from '@/lib/utils';
import { Plus, ExternalLink, MessageSquare, GitPullRequest } from 'lucide-react';

export default function ClientDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeSessions = sessions.filter(
    (s) => !['completed', 'refunded', 'cancelled'].includes(s.status)
  );
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  return (
    <DashboardLayout role="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Sessions</h2>
            <p className="text-sm text-gray-500">
              Track the progress of your VibeFix sessions.
            </p>
          </div>
          <Link href="/submit">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{activeSessions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCents(sessions.reduce((sum, s) => sum + s.amount_cents, 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center text-gray-500">Loading sessions...</div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">You haven&apos;t submitted any projects yet.</p>
              <Link href="/submit">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Submit Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Session list */}
        {!loading && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => {
              const tier = TIER_CONFIG[session.tier];
              return (
                <Card key={session.id}>
                  <CardContent className="py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(session.status)}`}>
                            {getStatusLabel(session.status)}
                          </span>
                          <Badge>{tier.name}</Badge>
                        </div>
                        <p className="mt-2 truncate text-sm font-medium text-gray-900">
                          {session.goal_description}
                        </p>
                        <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(session.created_at)}</span>
                          <span>{formatCents(session.amount_cents)}</span>
                          {session.repo_url && (
                            <a
                              href={session.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-indigo-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Repo
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.pr_url && (
                          <a
                            href={session.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-1">
                              <GitPullRequest className="h-3 w-3" />
                              PR
                            </Button>
                          </a>
                        )}
                        <Link href={`/dashboard/client/session/${session.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            View
                          </Button>
                        </Link>
                        {session.status === 'pending_review' && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              await fetch(`/api/sessions/${session.id}/confirm`, {
                                method: 'POST',
                              });
                              window.location.reload();
                            }}
                          >
                            Confirm & Pay Expert
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
