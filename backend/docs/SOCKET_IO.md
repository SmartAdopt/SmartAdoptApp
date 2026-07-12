# WebSockets Integration (Socket.IO)

SmartAdoptApp uses WebSockets through **Socket.IO** to maintain real-time, bidirectional communication between the server and the client. This allows interfaces to update instantly without the user having to reload the page.

## Main Event Flow

### 1. Adoption Requests and Notifications Update
- **Trigger:** The administrator approves or rejects an adoption request.
- **Backend:** Emits the `application_status_update` event through `socketio_manager.py`.
- **Frontend:** 
  - The centralized hook `useAppSocketIO.ts` listens to the server event.
  - It invalidates the React Query cache (if applicable) and dispatches a global `CustomEvent` on the browser's `window` object named `application_status_update`.
  - Interested components (`AdopterRequests.tsx` for the requests panel and `NotificationsPanel.tsx` for the notification bell) have an *event listener* that reacts to this global event.
  - Upon hearing the event, they execute refresh functions (`fetchRequests()` and `refreshNotifications()`) to load the new data silently in the background.
  - **Visual result:** The user sees their request status change (approved/rejected) and adds a "+1" to their notification counter entirely seamlessly and instantly.

### 2. Pet Status Update
- **Trigger:** A pet changes status (e.g., from 'available' to 'adopted') or an administrator updates its profile.
- **Backend:** Emits the `pet_status_update` event.
- **Frontend:** Receives the event so that the catalog interfaces reflect the update in real-time, blocking parallel requests if the pet has already been adopted.

### 3. New Registrations
- **Trigger:** A new pet is registered in the system.
- **Backend:** Emits the `new_pet_registered` event.
- **Frontend:** Allows notifying users or automatically updating catalogs with the newly generated profiles.

### 4. Favorites Syncing
- **Trigger:** An adopter adds or removes a pet from their favorites.
- **Backend:** Emits the `favorites_update` event targeting specifically the personal room of that user (`user_{user_id}`).
- **Frontend:** 
  - `useAppSocketIO.ts` receives the event and invalidates the favorites cache.
  - Dispatches a `favorites_update` CustomEvent.
  - The centralized `PetContext.tsx` dynamically adds or removes the pet ID from the state, making the heart icons update in real-time across multiple devices/tabs for the same user without needing a full page reload.

## Base Architecture
- **Backend:** Implemented with the `python-socketio` library (mounted as an ASGI application over FastAPI in `app/main.py`).
- **Frontend:** Uses `socket.io-client` wrapped in a React context (`SocketProvider`). The `useAppSocketIO` hook is the bridge that centralizes the connection, handles authentication tokens for the socket, and distributes the received events to all user interface components via `window.dispatchEvent`.
