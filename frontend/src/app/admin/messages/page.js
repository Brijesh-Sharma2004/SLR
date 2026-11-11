"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Mail,
  Eye,
  Archive,
  Trash2,
  Filter,
  MessageSquare,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api-errors";

const statusLabels = {
  UNREAD: "Unread",
  READ: "Read",
};

const statusColors = {
  UNREAD: "bg-blue-100 text-blue-700",
  READ: "bg-gray-100 text-gray-700",
};

export default function AdminMessagesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // Redirect handled by layout
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        if (statusFilter) params.append("status", statusFilter);
        if (searchQuery) params.append("email", searchQuery);

        const response = await apiRequest(`/contact?${params.toString()}`);
        setMessages(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages,
        }));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    if (isAdmin) {
      fetchMessages();
    }
  }, [isAdmin, pagination.page, pagination.limit, statusFilter, searchQuery]);

  async function handleStatusChange(messageId, newStatus) {
    try {
      const response = await apiRequest(`/contact/${messageId}/${newStatus.toLowerCase()}`, {
        method: "PATCH",
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? response.data : msg
        )
      );
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(messageId) {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return;
    }
    try {
      await apiRequest(`/contact/${messageId}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#737cff]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#211d50]">Contact Messages</h1>
          <p className="mt-1 text-gray-600">View and manage contact form submissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-12 pr-4 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff]"
          />
        </div>
        <div className="relative max-w-xs">
          <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-12 pr-10 py-3 outline-none focus:border-[#858ff0] focus:ring-2 focus:ring-[#efedff] appearance-none"
          >
            <option value="">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Messages Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#737cff]" />
                <p className="mt-4 text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No messages found</h3>
                <p className="mt-2 text-gray-500">
                  {searchQuery || statusFilter
                    ? "Try adjusting your filters"
                    : "No contact messages yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full px-6 py-4 text-left transition ${
                      selectedMessage?.id === message.id
                        ? "bg-[#f8f9ff] border-r-2 border-[#a5acf3]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className={`font-medium text-gray-900 ${
                            message.status === "UNREAD" ? "font-semibold" : ""
                          }`}>
                            {message.name}
                          </h4>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[message.status]}`}>
                            {statusLabels[message.status]}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 truncate">{message.subject}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {message.email} • {formatDate(message.createdAt)}
                        </p>
                      </div>
                      {message.status === "UNREAD" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Mail size={16} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} messages
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedMessage.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[selectedMessage.status]}`}>
                    {statusLabels[selectedMessage.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">{selectedMessage.subject}</p>
                <p className="mt-1 text-xs text-gray-400">{formatDate(selectedMessage.createdAt)}</p>
              </div>

              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  {selectedMessage.status === "UNREAD" && (
                    <button
                      onClick={() => handleStatusChange(selectedMessage.id, "READ")}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Mark as Read
                    </button>
                  )}
                  {selectedMessage.status === "READ" && (
                    <button
                      onClick={() => handleStatusChange(selectedMessage.id, "UNREAD")}
                      className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Mark as Unread
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white shadow-sm p-12 text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Select a message</h3>
              <p className="mt-2 text-gray-500">Click on a message from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}