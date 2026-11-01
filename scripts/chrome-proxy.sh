#!/bin/sh
# Headless Chrome для Remotion: ходит через прокси окружения и доверяет его CA (Anthropic) по отпечатку ключа.
D=$(mktemp -d); awk -v d="$D" '/BEGIN CERT/{n++} {print > (d "/" n ".pem")}' /root/.ccr/ca-bundle.crt
L=""; for f in "$D"/*.pem; do
  openssl x509 -in "$f" -noout -subject 2>/dev/null | grep -q Anthropic || continue
  h=$(openssl x509 -in "$f" -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64)
  L="${L:+$L,}$h"
done; rm -rf "$D"
exec /opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --proxy-server="$HTTPS_PROXY" --ignore-certificate-errors-spki-list="$L" "$@"
