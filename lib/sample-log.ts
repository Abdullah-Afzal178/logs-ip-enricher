/** Realistic mixed-format sample so the tool is useful without a real log. */
export const SAMPLE_LOG = `8.8.8.8 - - [07/Sep/2026:10:14:52 +0000] "GET /index.html HTTP/1.1" 200 1043 "-" "Mozilla/5.0"
45.83.64.12 - - [07/Sep/2026:10:14:53 +0000] "POST /wp-login.php HTTP/1.1" 404 209 "-" "curl/8.5.0"
45.83.64.12 - - [07/Sep/2026:10:14:54 +0000] "POST /wp-login.php HTTP/1.1" 404 209 "-" "curl/8.5.0"
45.83.64.12 - - [07/Sep/2026:10:14:55 +0000] "POST /xmlrpc.php HTTP/1.1" 404 209 "-" "curl/8.5.0"
104.16.0.1 - - [07/Sep/2026:10:15:01 +0000] "GET /assets/app.js HTTP/1.1" 200 88211 "-" "Mozilla/5.0"
{"ts":"2026-09-07T10:15:04Z","client_ip":"24.48.0.1","upstream":"10.0.0.5:9000","status":502}
Sep  7 10:15:07 gateway sshd[2211]: Failed password for root from 194.26.29.84 port 52344 ssh2
Sep  7 10:15:09 gateway sshd[2213]: Failed password for admin from 194.26.29.84 port 52388 ssh2
2026-09-07 10:15:12 INFO proxy forwarded 2606:4700:4700::1111 -> 172.16.0.9
2026-09-07 10:15:15 WARN rate-limit 1.1.1.1 exceeded 100 req/min
192.168.1.24 - - [07/Sep/2026:10:15:18 +0000] "GET /health HTTP/1.1" 200 2 "-" "kube-probe/1.29"
`;
