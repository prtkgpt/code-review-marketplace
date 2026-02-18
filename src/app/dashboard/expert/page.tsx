'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Session, TIER_CONFIG } from '@/types/database';
import { getStatusColor, getStatusLabel, formatCents } from '@/lib/utils';
import { ExternalLink, ArrowRight, DollarSign, Clock } from 'lucide-react';

export default function ExpertDashboard() {
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/experts/queue').then((r) => r.json()),
      fetch('/api/experts/sessions').then((r) => r.json()),
    ]).then(([queueData, sessionsData]) => {
      setAvailableSessions(queueData.sessions || []);
      setMySessions(sessionsData.sessions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeSessions = mySessions.filter(
    (s) => !['completed', 'refunded', 'cancelled'].includes(s.status)
  );
  const completedSessions = mySessions.filter((s) => s.status === 'completed');
  const totalEarnings = completedSessions.reduce(
    (sum, s) => sum + s.expert_payout_cents,
    0
  );

  const handleClaim = async (sessionId: string) => {
    await fetch(`/api/sessions/${sessionId}/claim`, { method: 'POST' });
    window.location.reload();
  };

  return (
    <DashboardLayout role="expert">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expert Dashboard</h2>
          <p className="text-sm text-gray-500">
            Claim sessions, deliver fixes, and earn.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-indigo-600">{activeSessions.length}</p>
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
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">{formatCents(totalEarnings)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-yellow-600">{availableSessions.length}</p>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        )}

        {/* Available sessions queue */}
        {!loading && availableSessions.length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Available Sessions</h3>
            <div className="space-y-3">
              {availableSessions.map((session) => {
                const tier = TIER_CONFIG[session.tier];
                return (
                  <Card key={session.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="info">{tier.name}</Badge>
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <DollarSign className="h-3 w-3" />
                              {formatCents(tier.expertPayoutCents)} payout
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {tier.deadlineHours}h deadline
                            </span>
                          </div>
                          <p className="mt-2 truncate text-sm text-gray-900">
                            {session.goal_description}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {session.stack_tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={session.repo_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Repo
                            </Button>
                          </a>
                          <Button size="sm" className="gap-1" onClick={() => handleClaim(session.id)}>
                            Claim
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* My active sessions */}
        {!loading && mySessions.length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">My Sessions</h3>
            <div className="space-y-3">
              {mySessions.map((session) => {
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
                            <span className="text-xs text-gray-500">
                              {formatCents(session.expert_payout_cents)} payout
                            </span>
                          </div>
                          <p className="mt-2 truncate text-sm text-gray-900">
                            {session.goal_description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {session.status === 'matched' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await fetch(`/api/sessions/${session.id}/start`, { method: 'POST' });
                                window.location.reload();
                              }}
                            >
                              Start Working
                            </Button>
                          )}
                          {session.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                const prUrl = prompt('Enter the PR URL:');
                                if (!prUrl) return;
                                await fetch(`/api/sessions/${session.id}/submit-pr`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ pr_url: prUrl }),
                                });
                                window.location.reload();
                              }}
                            >
                              Submit PR
                            </Button>
                          )}
                          <a href={`/dashboard/client/session/${session.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {!loading && mySessions.length === 0 && availableSessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No sessions available right now. Check back soon.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
