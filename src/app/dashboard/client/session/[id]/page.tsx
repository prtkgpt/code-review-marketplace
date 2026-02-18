'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Session, Message, TIER_CONFIG } from '@/types/database';
import { getStatusColor, getStatusLabel, formatDate, formatDateTime, formatCents } from '@/lib/utils';
import { Send, ExternalLink, GitPullRequest, Clock, Shield } from 'lucide-react';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const [sessionRes, messagesRes] = await Promise.all([
      fetch(`/api/sessions/${id}`),
      fetch(`/api/sessions/${id}/messages`),
    ]);
    const sessionData = await sessionRes.json();
    const messagesData = await messagesRes.json();
    setSession(sessionData.session);
    setMessages(messagesData.messages || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/sessions/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage('');
      await fetchData();
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="client">
        <div className="py-12 text-center text-gray-500">Loading session...</div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout role="client">
        <div className="py-12 text-center text-gray-500">Session not found.</div>
      </DashboardLayout>
    );
  }

  const tier = TIER_CONFIG[session.tier];

  return (
    <DashboardLayout role="client">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Session info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusLabel(session.status)}
                  </span>
                  <Badge>{tier.name} — {formatCents(session.amount_cents)}</Badge>
                </div>
                <p className="mt-3 text-sm text-gray-900">{session.goal_description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Submitted {formatDate(session.created_at)}
                  </span>
                  {session.deadline_at && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Deadline: {formatDate(session.deadline_at)}
                    </span>
                  )}
                </div>
                {session.stack_tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {session.stack_tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {session.repo_url && (
                  <a href={session.repo_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Repo
                    </Button>
                  </a>
                )}
                {session.pr_url && (
                  <a href={session.pr_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1">
                      <GitPullRequest className="h-3 w-3" />
                      Pull Request
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm button */}
        {session.status === 'pending_review' && (
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-gray-900">Ready to confirm?</p>
                <p className="text-sm text-gray-500">
                  Review the PR and confirm the fix works to release payment to the expert.
                </p>
              </div>
              <Button
                onClick={async () => {
                  await fetch(`/api/sessions/${id}/confirm`, { method: 'POST' });
                  await fetchData();
                }}
              >
                Confirm & Complete
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {messages.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No messages yet. Start the conversation below.
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_system ? 'justify-center' : 'justify-start'}`}
                >
                  {msg.is_system ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                      {msg.content}
                    </span>
                  ) : (
                    <div className="max-w-[80%] rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">
                          {msg.sender?.name || 'User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-gray-800">{msg.content}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
              <Textarea
                rows={2}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
