# How to Share Local Server Over the Internet (Step-by-Step)

A complete guide to exposing your local server (`localhost:5000`) to the public internet for mobile testing, webhook integration (e.g., Stripe, SSLCommerz), or sharing with teammates.

---

## ⚠️ The Golden Rule
> **Never close your backend server!**
> 
> You **MUST** run your backend server and the tunnel tool simultaneously in **two separate terminal windows/tabs**. If you stop your server, the tunnel will show **`502 Bad Gateway`**.

---

## Method 1: Using Localtunnel (Quickest & No Account Required)

### Step 1: Start Your Backend Server (Terminal 1)
Open your terminal in your project directory and start your backend:
```bash
npm run dev
```
Make sure you see the confirmation message:
```text
Database connected
Server is running on port 5000
```
> **Leave this terminal running.** Do not press `Ctrl + C`.

---

### Step 2: Open a Second Terminal & Run Localtunnel (Terminal 2)
Open a new terminal tab in your IDE (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>`</kbd> or click the **`+`** icon) and run:
```bash
npx localtunnel --port 5000
```
*(Replace `5000` with whatever port your server runs on if different).*

You will get an output with your public URL:
```text
your url is: https://lemon-oranges-lose.loca.lt
```

---

### Step 3: Bypass the Localtunnel Security Reminder

When you first open this URL, Localtunnel displays an anti-abuse verification page:

#### A. If Opening in a Web Browser:
1. Look at the IP address shown on the page (e.g., `This tunnel is hosted by: 203.190.14.228`).
2. Copy that IP address and paste it into the **"IP Address"** text box.
3. Click **Submit** or **Click to Continue**.
4. Your server response (e.g. `{"message": "Prisma-Press Server is running"}`) will now load.

#### B. If Testing via Postman / Thunder Client / Frontend:
Add this custom request header to automatically bypass the verification screen:

| Header Key | Header Value |
| :--- | :--- |
| `bypass-tunnel-reminder` | `true` |

---

## Method 2: Using Ngrok (Alternative)

If you prefer a faster and more stable tunnel:

1. Run in a second terminal:
   ```bash
   npx ngrok http 5000
   ```
2. Copy the generated `Forwarding` URL (e.g., `https://xxxx.ngrok-free.app`).
3. For free ngrok accounts, add the header:
   ```text
   ngrok-skip-browser-warning: true
   ```

---

## Common Issues & Troubleshooting

### 1. `502 Bad Gateway`
* **Cause:** Your backend server (`npm run dev`) is not running.
* **Fix:** Check Terminal 1 and verify your server is active and listening on port `5000`.

### 2. `spawn ... code-tunnel.exe ENOENT`
* **Cause:** The IDE attempted to use VS Code's internal Dev Tunnel binary which is not bundled with your IDE.
* **Fix:** This error has no impact on local execution. You can safely ignore it or disable it in settings:
  1. Open Settings (<kbd>Ctrl</kbd> + <kbd>,</kbd>).
  2. Search for `remote.autoForwardPorts` and uncheck it.

### 3. CORS Error on the Frontend
If your frontend application cannot access the tunnel URL, ensure your CORS middleware in `src/app.ts` allows requests from all origins or your frontend URL:
```typescript
app.use(cors({
    origin: true, // or specific frontend URL
    credentials: true,
}));
```

---

## Summary Checklist
- [ ] Terminal 1: `npm run dev` is active.
- [ ] Terminal 2: `npx localtunnel --port 5000` is active.
- [ ] Browser: Submitted the host IP once.
- [ ] Postman: Added `bypass-tunnel-reminder: true` header.
