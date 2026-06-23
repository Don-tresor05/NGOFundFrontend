import { useEffect, useState } from 'react';
import { Mail, User, MessageSquare, Send } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface DonorMessage {
  id: number;
  donor: {
    id: number;
    organization_name: string;
    contact_person: string;
    contact_email: string;
  };
  subject: string;
  message: string;
  communication_date: string;
  channel: string;
  status: string;
}

export default function DonorMessagesPage() {
  const { currentProfile } = useAuthStore();
  const [messages, setMessages] = useState<DonorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await apiRequest('/donor-communications/?ordering=-communication_date');
      const allMessages = data.results || data;
      // Filter to only show donor_portal and staff_reply messages
      const relevantMessages = allMessages.filter((msg: DonorMessage) => 
        msg.channel === 'donor_portal' || msg.channel === 'staff_reply'
      );
      setMessages(relevantMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedDonor) return;
    
    setSending(true);
    try {
      await apiRequest('/donor-communications/', {
        method: 'POST',
        body: JSON.stringify({
          donor_id: selectedDonor,
          channel: 'staff_reply',
          subject: 'Reply from NGO Team',
          message: replyText,
          communication_date: new Date().toISOString(),
        }),
      });
      setReplyText('');
      alert('Reply sent successfully!');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group messages by donor
  const donorGroups = messages.reduce((acc, msg) => {
    if (!acc[msg.donor.id]) {
      acc[msg.donor.id] = {
        donor: msg.donor,
        messages: [],
        lastMessage: msg
      };
    }
    acc[msg.donor.id].messages.push(msg);
    return acc;
  }, {} as Record<number, { donor: any; messages: DonorMessage[]; lastMessage: DonorMessage }>);

  const donors = Object.values(donorGroups);
  const selectedDonorData = selectedDonor ? donorGroups[selectedDonor] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Donor Messages</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <p className="text-slate-600 mb-6">Messages received from donors via the donor portal</p>

        {loading ? (
          <div className="text-center py-12">Loading messages...</div>
        ) : donors.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Mail className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Messages Yet</h3>
            <p className="text-slate-600">Donor messages will appear here when they contact you through the portal.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Donor List */}
            <div className="lg:col-span-1 space-y-3">
              {donors.map((group) => (
                <div
                  key={group.donor.id}
                  onClick={() => setSelectedDonor(group.donor.id)}
                  className={`bg-white rounded-lg p-4 border cursor-pointer transition-all hover:shadow-md ${
                    selectedDonor === group.donor.id
                      ? 'border-blue-500 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">
                        {group.donor.organization_name}
                      </h4>
                      <p className="text-sm text-slate-600 truncate">{group.messages.length} message{group.messages.length !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(group.lastMessage.communication_date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              {selectedDonorData ? (
                <div className="bg-white rounded-xl border border-slate-200 flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedDonorData.donor.organization_name}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {selectedDonorData.donor.contact_person} • {selectedDonorData.donor.contact_email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedDonorData.messages.slice().reverse().map((msg) => (
                      <div key={msg.id} className={`flex ${msg.channel === 'donor_portal' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          msg.channel === 'donor_portal' 
                            ? 'bg-slate-100 text-slate-900' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-2 ${msg.channel === 'donor_portal' ? 'text-slate-500' : 'text-blue-100'}`}>
                            {formatDate(msg.communication_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Box */}
                  <div className="border-t border-slate-200 p-4">
                    <div className="flex gap-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        rows={3}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Donor</h3>
                  <p className="text-slate-600">Click on a donor to view message history</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
