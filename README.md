# sshx-web

A web client for starting sshx and giving the link to those with a correct
password.

**WARNING!!! THIS IS HIGHLY LIKELY TO BE INSECURE IN PRODUCTION! USE AT YOUR OWN
RISK, AND PREFERABLY PLACE THIS BEHIND SOME SORT OF SECURITY SYSTEM**

Built with some help from [@QinCai-rui](https://github.com/QinCai-rui/)

## systemd

Here's a service file that could work for you:

```
[Unit]
Description=SSHX

[Service]
WorkingDirectory=/home/USER
User=USER
Group=USER
Type=simple
StandardOutput=journal
ExecStart=/home/USER/.bun/bin/bun /home/USER/sshx-web/index.js

[Install]
WantedBy=default.target
```

You will need to do some changes; for example, change `USER` to your user.
