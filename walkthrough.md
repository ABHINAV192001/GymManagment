# Verification: Persistent Chat Service

I have replaced the browser-local chat with a database-backed persistent chat service.

## What Changed
- **Backend**:
  - Created `Message` entity in database.
  - Added `MessageRepository` for CRUD operations.
  - Added `ChatService` and `ChatController`.
  - Exposed `/api/chat/send` and `/api/chat/history?userId=...` endpoints.
- **Frontend**:
  - Updated `lib/api/chat.js` to call the new backend APIs instead of using `localStorage`.
  - Implemented client-side grouping of messages into conversations.

## How to Verify
1. **Login as User**:
   - Go to `http://localhost:3000` (User Dashboard).
   - Click the "Chat" button.
   - Start a chat with "Gym Admin".
   - Send "Hello from Database!".

2. **Login as Admin**:
   - Open a **new browser window/profile** (or Incognito).
   - Login as Org Admin (`owner@example.com` / `StrongPass!` or your credentials).
   - Open the chat.
   - You should see the message "Hello from Database!".
   - Reply "Received loud and clear.".

3. **Check Persistence**:
   - **Reload** both pages.
   - The messages should still be there (fetched from DB).

## Notes
- Messages are polled every 2 seconds.
- The system currently assumes `senderId` and `receiverId` are strings.
