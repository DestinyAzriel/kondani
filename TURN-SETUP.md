# Kondani — TURN server setup (coturn on your existing Ubuntu AWS instance)

This makes audio/video calls work reliably on mobile networks. Your app is
already wired for TURN — once this is running, you only set 4 env vars on the
frontend. No app code changes.

Throughout, replace:
- `PUBLIC_IP`  → your EC2 instance's public IP
- `PRIVATE_IP` → your EC2 instance's private IP
- `STRONGPASS` → a long random password you choose (e.g. 24+ characters)

Find your IPs by SSHing into the box and running:
```bash
curl -s ifconfig.me            # public IP
hostname -I | awk '{print $1}' # private IP
```

---

## Step 1 — Open the ports (AWS Security Group)

In the AWS console → EC2 → your instance → **Security** tab → click the
security group → **Edit inbound rules** → add these (Source `0.0.0.0/0`):

| Type        | Protocol | Port range   | Purpose            |
|-------------|----------|--------------|--------------------|
| Custom TCP  | TCP      | 3478         | TURN control       |
| Custom UDP  | UDP      | 3478         | TURN control       |
| Custom UDP  | UDP      | 49152–65535  | Media relay range  |
| Custom TCP  | TCP      | 5349         | TURN over TLS (opt)|

Keep your existing SSH (22) rule. Save.

---

## Step 2 — Install coturn

SSH into the instance, then:
```bash
sudo apt update
sudo apt install coturn -y
```

Enable the service:
```bash
sudo sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn
```

---

## Step 3 — Configure it

Back up the default and write a fresh config:
```bash
sudo mv /etc/turnserver.conf /etc/turnserver.conf.bak 2>/dev/null
sudo tee /etc/turnserver.conf > /dev/null <<'EOF'
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0
min-port=49152
max-port=65535

# EC2 is behind 1:1 NAT — this maps public<->private so relay works:
external-ip=PUBLIC_IP/PRIVATE_IP

# Long-term credential (must match the frontend env vars):
lt-cred-mech
user=kondani:STRONGPASS
realm=kondani.app

fingerprint
no-cli
no-tlsv1
no-tlsv1_1
simple-log
log-file=/var/log/turnserver.log
EOF
```

Then edit in your real values:
```bash
sudo nano /etc/turnserver.conf
# replace PUBLIC_IP, PRIVATE_IP, STRONGPASS — save with Ctrl+O, Enter, Ctrl+X
```

Start it:
```bash
sudo systemctl restart coturn
sudo systemctl enable coturn
sudo systemctl status coturn   # should say "active (running)"
```

---

## Step 4 — Test it works

Open this page on your computer:
https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

- TURN URI: `turn:PUBLIC_IP:3478`
- Username: `kondani`
- Password: `STRONGPASS`

Click **Add Server**, then **Gather candidates**. If you see candidates of
type **`relay`**, your TURN server works. (If you only see `host`/`srflx` and
no `relay`, re-check the ports in Step 1 and `external-ip` in Step 3.)

---

## Step 5 — Point the app at it (frontend env vars)

On your **frontend** (Render static site → Environment), add:
```
VITE_STUN_SERVER_URL=stun:PUBLIC_IP:3478
VITE_TURN_SERVER_URL=turn:PUBLIC_IP:3478
VITE_TURN_USERNAME=kondani
VITE_TURN_CREDENTIAL=STRONGPASS
```
Then redeploy the frontend so the new build picks them up. Done — calls will
now relay through your TURN server when a direct connection isn't possible.

---

## Notes / later improvements
- **Static credentials** (above) are fine to launch. Because they ship in the
  frontend, someone could in theory extract them to relay their own traffic
  (bandwidth theft). When you have time, upgrade to **time-limited credentials**
  (`use-auth-secret` + a shared secret, with the backend minting short-lived
  user/pass). Not urgent for launch.
- TURN relays *media*, so it uses bandwidth on the instance only when a direct
  peer-to-peer path fails. Keep an eye on data usage if call volume grows; if it
  gets heavy, move coturn to its own instance.
- For `turns:` (TLS on 5349) you'd point a domain at the box and add a
  certificate. Plain `turn:` on 3478 is enough to get calls working now.
