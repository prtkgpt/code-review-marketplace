import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    matched: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-purple-100 text-purple-800',
    pr_submitted: 'bg-cyan-100 text-cyan-800',
    pending_review: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    refund_requested: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Pending Payment',
    paid: 'Paid — Awaiting Match',
    matched: 'Expert Matched',
    in_progress: 'In Progress',
    pr_submitted: 'PR Submitted',
    pending_review: 'Pending Review',
    completed: 'Completed',
    refund_requested: 'Refund Requested',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}
