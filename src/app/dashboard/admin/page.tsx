'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Session, TIER_CONFIG } from '@/types/database';
import { getStatusColor, getStatusLabel, formatDate, formatCents } from '@/lib/utils';
import { Users, DollarSign, FolderOpen, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/sessions')
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.platform_fee_cents, 0);

  const activeCount = sessions.filter(
    (s) => !['completed', 'refunded', 'cancelled', 'pending_payment'].includes(s.status)
  ).length;

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const refundCount = sessions.filter(
    (s) => s.status === 'refunded' || s.status === 'refund_requested'
  ).length;

  const refundRate = sessions.length > 0
    ? ((refundCount / sessions.length) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
          <p className="text-sm text-gray-500">Platform health and session management.</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform Revenue</p>
                <p className="text-xl font-bold text-gray-900">{formatCents(totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <FolderOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="text-xl font-bold text-gray-900">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Refund Rate</p>
                <p className="text-xl font-bold text-gray-900">{refundRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        )}

        {/* All sessions table */}
        {!loading && sessions.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">All Sessions</h3>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Tier</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Goal</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Amount</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusLabel(session.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge>{TIER_CONFIG[session.tier].name}</Badge>
                      </td>
                      <td className="max-w-xs truncate px-6 py-4 text-gray-900">
                        {session.goal_description}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {formatCents(session.amount_cents)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(session.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {session.status === 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const expertId = prompt('Enter expert user ID to assign:');
                                if (!expertId) return;
                                await fetch(`/api/admin/sessions/${session.id}/assign`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ expert_id: expertId }),
                                });
                                window.location.reload();
                              }}
                            >
                              Assign Expert
                            </Button>
                          )}
                          {session.status === 'refund_requested' && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={async () => {
                                await fetch(`/api/admin/sessions/${session.id}/refund`, {
                                  method: 'POST',
                                });
                                window.location.reload();
                              }}
                            >
                              Process Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
