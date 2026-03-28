import { apiGet, apiPost, apiPut } from './client';
import { getUsers, getStaff, getTrainers } from './branch';
import { CHAT_API_BASE_URL } from './config';

export const getConversations = async (currentUser) => {
    // 1. Fetch all messages for current user
    const userId = String(currentUser.id || currentUser.userCode);
    let messages = [];
    try {
        messages = await apiGet(`/api/chat/history?userId=${userId}`, {}, { baseUrl: CHAT_API_BASE_URL });
    } catch (e) {
        console.error("Failed to fetch chat history", e);
        return [];
    }

    // 2. Group messages by partner
    const conversationsMap = new Map();

    messages.forEach(msg => {
        // Identify partner ID
        // If I sent it, partner is receiver. If I received it, partner is sender.
        const partnerId = (String(msg.senderId) === userId) ? String(msg.receiverId) : String(msg.senderId);

        if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, {
                id: getConvId(userId, partnerId),
                partnerId: partnerId,
                messages: [],
                lastMessage: '',
                timestamp: '',
                unread: 0
            });
        }

        const conv = conversationsMap.get(partnerId);
        conv.messages.push({
            id: msg.id,
            sender: String(msg.senderId),
            text: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Simple formatting
        });

        // Update summary info
        conv.lastMessage = msg.content;
        conv.timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Update unread count
        if (msg.isRead === false && String(msg.receiverId) === userId) {
            conv.unread += 1;
        }
    });

    // 3. Enrich with Partner Name/Details
    const contacts = await getContacts(currentUser);
    const contactMap = new Map(contacts.map(c => [String(c.id), c]));

    const enrichedConversations = [];

    for (const [partnerId, conv] of conversationsMap.entries()) {
        const contact = contactMap.get(String(partnerId));
        if (contact) {
            conv.partner = contact;
            enrichedConversations.push(conv);
        } else {
            // Fallback for unknown contact
            conv.partner = { id: partnerId, name: `User ${partnerId}`, role: 'Unknown' };
            enrichedConversations.push(conv);
        }
    }

    return enrichedConversations;
};

// Helper to generate a conversation ID (client side utility)
const getConvId = (id1, id2) => [String(id1), String(id2)].sort().join('_');

let cachedContacts = null;
let lastContactFetch = 0;
const CACHE_DURATION = 300000; // 5 minutes

export const getContacts = async (currentUser) => {
    if (!currentUser) return [];

    // Return cached contacts if available and fresh
    const now = Date.now();
    if (cachedContacts && (now - lastContactFetch < CACHE_DURATION)) {
        return cachedContacts;
    }

    const role = currentUser.role;
    let contacts = [];

    try {
        // --- ADMIN / OWNER / BRANCH_ADMIN / ORG_ADMIN ---
        if (['ADMIN', 'OWNER', 'BRANCH_ADMIN', 'ORG_ADMIN'].includes(role)) {
            // Admin/Owner can chat with everyone: Users, All Staff (including trainers)
            const [users, allStaff] = await Promise.all([
                getUsers().catch(() => []),
                getStaff().catch(() => [])
            ]);

            // Map Users
            contacts.push(...(Array.isArray(users) ? users : []).map(u => ({
                id: String(u.id || u.userCode),
                name: u.name,
                role: 'USER',
                avatar: null
            })));

            // Map All Staff (Staff + Trainers are returned by getStaff)
            contacts.push(...(Array.isArray(allStaff) ? allStaff : []).map(s => ({
                id: String(s.id || s.code || s.staffCode || s.trainerCode),
                name: s.name,
                role: s.role || (s.entityType === 'TRAINER' ? 'TRAINER' : 'STAFF'),
                avatar: null
            })));

            // Filter out self
            const currentId = String(currentUser.id || currentUser.userCode);
            contacts = contacts.filter(c => String(c.id) !== currentId);
        }
        // --- STAFF / TRAINER ---
        else if (['STAFF', 'TRAINER'].includes(role)) {
            contacts.push({ id: '1', name: 'Branch Admin', role: 'ADMIN' });

            try {
                const users = await getUsers();
                if (Array.isArray(users)) {
                    contacts.push(...users.map(u => ({
                        id: String(u.id || u.userCode),
                        name: u.name,
                        role: 'USER'
                    })));
                }
            } catch (e) {
                console.warn("Trainer/Staff could not fetch all users", e);
            }
        }
        // --- USER ---
        // --- USER ---
        else {
            contacts.push({ id: '1', name: 'Gym Admin', role: 'ADMIN' });

            if (currentUser.trainerName) {
                contacts.push({
                    id: String(currentUser.trainerCode || currentUser.trainerId || 'trainer'),
                    name: currentUser.trainerName,
                    role: 'TRAINER'
                });
            }
        }
    } catch (error) {
        console.error("Failed to fetch dynamic contacts:", error);
        // If fetch fails but we have cache (even if old), return cache
        if (cachedContacts) return cachedContacts;
    }

    // Deduplicate
    const uniqueContacts = [];
    const seen = new Set();
    for (const c of contacts) {
        const cid = String(c.id);
        if (!seen.has(cid)) {
            seen.add(cid);
            c.id = cid;
            uniqueContacts.push(c);
        }
    }

    cachedContacts = uniqueContacts;
    lastContactFetch = now;
    return uniqueContacts;
};

export const sendMessage = async (currentUser, contact, text) => {
    try {
        const payload = {
            senderUsername: String(currentUser.id || currentUser.userCode), // Using ID as username is common in this app
            receiverUsername: String(contact.id),
            content: text
        };

        const response = await apiPost('/api/chat/send', payload, { baseUrl: CHAT_API_BASE_URL });

        return {
            id: response.id,
            sender: String(response.senderId),
            text: response.content,
            time: new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    } catch (error) {
        console.error("Send message failed", error);
        throw error;
    }
};

export const markMessagesAsRead = async (currentUser, partnerId) => {
    try {
        const payload = {
            receiverId: String(currentUser.id || currentUser.userCode),
            senderId: String(partnerId)
        };
        await apiPost('/api/chat/mark-read', payload, { baseUrl: CHAT_API_BASE_URL });
    } catch (error) {
        console.error("Mark as read failed", error);
    }
};

// --- Notifications ---

export const getNotifications = async (username) => {
    try {
        return await apiGet(`/api/notifications/${username}`, {}, { baseUrl: CHAT_API_BASE_URL });
    } catch (e) {
        console.error("Failed to fetch notifications", e);
        return [];
    }
};

export const getUnreadCount = async (username) => {
    try {
        return await apiGet(`/api/notifications/${username}/unread-count`, {}, { baseUrl: CHAT_API_BASE_URL });
    } catch (e) {
        console.error("Failed to fetch unread count", e);
        return 0;
    }
};

export const markAsRead = async (id) => {
    try {
        await apiPut(`/api/notifications/${id}/read`, {}, { baseUrl: CHAT_API_BASE_URL });
    } catch (e) {
        console.error("Failed to mark notification as read", e);
    }
};
