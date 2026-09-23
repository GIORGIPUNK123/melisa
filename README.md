# Melisa

Melisa is a private chat app. The browser encrypts messages. The server stores them and never decrypts them.

The live site is `https://melisa-phi.vercel.app`. The API is `https://melisa-back.onrender.com`.

## Run it

```bash
npm install
npm run dev
```

The dev server is Vite. Open the URL it prints.

`npm run build` typechecks and builds the production site. `npm run preview` serves that build.

### Environment

Create `.env` in this folder:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
VITE_API_PROXY_TARGET=http://localhost:3006
```

`VITE_API_PROXY_TARGET` is only for `npm run dev`. It is where Vite sends `/api`. Use `http://localhost:3006` when `melisa-back` is running locally. Use `https://melisa-back.onrender.com` to hit the deployed API.

Production does not use that variable. The built app always calls `/api`, and Vercel forwards `/api` to Render. That rewrite is in `vercel.json`.

## How a request moves

There are two paths.

**Express API.** Friends, settings, blocks, and groups go through Axios. The client is `src/api/instance.ts`. Its base URL is `/api`, and it attaches the Supabase login token. You do not add the token in each call.

- Locally, Vite strips `/api` and proxies to `VITE_API_PROXY_TARGET`.
- On Vercel, `vercel.json` strips `/api` and proxies to Render.

**Supabase.** Login, messages, reactions, presence, and the chat list go to Supabase from the browser. The client is `src/db/supabase.ts`. Row Level Security decides what a user can read and write.

## Screens

| URL | File | What it is |
| --- | --- | --- |
| `/login` | `src/pages/Login.tsx` | Email and password sign-in |
| `/register` | `src/pages/Register.tsx` | Create an account |
| `/` | `src/pages/Main.tsx` | The app after login |

`Main.tsx` is the shell. It holds the sidebar, the open chat, and the modals. If there is a session but no unlocked private key, it shows the unlock screen instead of the chat.

## Sign-in and the private key

1. Register sends email, password, username, and nickname to `POST /api/auth/register`. The backend creates the encryption keys. The new user must confirm their email before they can sign in.
2. Login uses Supabase `signInWithPassword` in `src/features/auth/hooks/useAuth.tsx`. The same password then downloads and decrypts the private key.
3. The private key stays in React state. A refresh loses it. The session remains, so the unlock screen asks for the password again.
4. Logout clears the session and the private key.

The password is both the login password and the password that wraps the chat key. Password changes re-encrypt that key before the login password is updated. That logic is `changeEncryptionPassword` in `useAuth.tsx`.

New passwords must be at least 6 characters and include a number. Change that rule in `src/features/auth/passwordPolicy.ts`. Existing shorter passwords can still log in.

## Encryption

All of this is in `src/features/chat/utils/chatCrypto.ts`.

**Direct chat.** A message is encrypted twice with `nacl.box`, once for the sender and once for the other person. The stored text looks like `enc:v2:...`. Both people can read it later. Older `enc:v1:` messages only have the recipient copy.

**Group chat.** The browser creates one random group key. That key is sealed for every member with `nacl.box` and sent to the API as envelopes. The API stores the envelopes. It does not learn the group key. Group message text looks like `enc:g1:...` and is encrypted with `nacl.secretbox`.

Sending and loading messages is `src/features/chat/hooks/useMessages.ts`. It writes rows straight to the Supabase `messages` table.

## What the sidebar does

`src/components/layout/Sidebar.tsx` switches between chats and friends.

- Chats come from `src/features/chat/hooks/useConversations.tsx`. A conversation is a row in `conversation_members` plus the other person, or the group name.
- Friends come from `GET /api/friends/list` in `src/features/friends/hooks/useFriendsList.tsx`.
- Adding a friend sends a request. It does not add them until the other person accepts. Accept, reject, and cancel are in `src/features/friends/hooks/usePendingRequests.tsx`.
- Removing a friend calls `DELETE /api/friends/with/:userId`.
- Blocking calls `POST /api/friends/block`. A block stops messages and new friend requests in both directions.

New friends and new groups show up from Supabase realtime on `friendships` and `conversation_members`. If a friend-accepted notification arrives, the lists refresh as well.

## Inside a chat

`src/features/chat/components/ChatArea.tsx` is the open conversation.

- Double-click a message for a heart. The reaction picker and chips are in `MessageList.tsx` and `useMessageReactions.ts`.
- Incoming messages arrive on a Supabase realtime channel in `useMessages.ts`. The sound is separate: `useUnreadMessages.tsx` hears the insert and plays audio unless the chat is muted.
- Mute is a flag on your `conversation_members` row.
- Direct chat info is `ChatInfo.tsx`. Group settings, roles, invites, rename, photo, clear, leave, and delete are `GroupSettings.tsx`. Group actions call `/api/conversations/group/...`.

Group roles: the creator can grant admin. Admins can remove people, clear messages, and delete the group. Some actions can be limited per member.

## Presence

`useHeartbeat.tsx` updates `last_seen_at` while the app is open. Friends and chat headers turn that into online or offline. `appear_offline` in settings hides online status.

## Folder map

```
src/pages            Login, Register, Main
src/features/auth    Session, unlock, password rule
src/features/chat    Messages, groups, reactions, conversation list
src/features/friends Friends, requests, blocks, profiles
src/features/notifications  Notification list and sounds
src/components       Sidebar, settings, confirm dialogs
src/api/instance.ts  Axios client for the Express API
src/db/supabase.ts   Supabase client
```

Change a feature in its folder. `Main.tsx` only wires those pieces together.
