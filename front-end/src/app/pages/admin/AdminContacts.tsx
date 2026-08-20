import { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronUp, Mail, Phone, MapPin } from 'lucide-react';
import { getAllContacts, deleteContact, AdminContact } from '../../api/contact';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { SEO } from '../../components/SEO';

export function AdminContacts() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    getAllContacts(token)
      .then(list =>
        setContacts([...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))),
      )
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load messages.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const handleDelete = async (contact: AdminContact) => {
    if (!token) return;
    if (!window.confirm(`Delete the message from "${contact.name}"? This cannot be undone.`)) return;
    setDeletingId(contact.id);
    try {
      await deleteContact(contact.id, token);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete message.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <SEO title="Contact Messages" url="/admin/contacts" noIndex />
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold tracking-tight">Contact Messages</h2>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground text-sm">Loading messages…</p>
        ) : contacts.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">No messages yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {contacts.map(contact => {
              const expanded = expandedId === contact.id;
              return (
                <div key={contact.id} className="p-5">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : contact.id)}
                    className="w-full flex items-start justify-between gap-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{contact.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(contact.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {contact.email}
                      </p>
                      {!expanded && (
                        <p className="text-sm text-muted-foreground mt-1.5 truncate">{contact.message}</p>
                      )}
                    </div>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-1" />
                    )}
                  </button>

                  {expanded && (
                    <div className="mt-4 pl-0 space-y-3">
                      {(contact.phoneNumber || contact.location) && (
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                          {contact.phoneNumber && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {contact.phoneNumber}
                            </span>
                          )}
                          {contact.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {contact.location}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm bg-accent/40 rounded-xl p-4 whitespace-pre-wrap">
                        {contact.message}
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(contact)}
                          disabled={deletingId === contact.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deletingId === contact.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
