FROM oven/bun

# Install SSH server
RUN apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd

# Set up working directory and Bun app
WORKDIR /usr/src/idle-rpg
COPY . .
RUN bun setup

# Expose app and SSH ports
EXPOSE 4000 22

# Environment variables for SSH user and key (can be set via docker run or .env)
ENV SSH_USER=user
ENV SSH_PUBLIC_KEY=""

# Configure SSH and user at build time if possible, otherwise at runtime
CMD bash -c '\
    # Create user if not exists \
    if ! id "$SSH_USER" &>/dev/null; then \
      useradd -m -s /bin/bash "$SSH_USER"; \
    fi; \
    # Set up SSH key if provided \
    if [ -n "$SSH_PUBLIC_KEY" ]; then \
      mkdir -p /home/$SSH_USER/.ssh; \
      echo "$SSH_PUBLIC_KEY" > /home/$SSH_USER/.ssh/authorized_keys; \
      chmod 700 /home/$SSH_USER/.ssh; \
      chmod 600 /home/$SSH_USER/.ssh/authorized_keys; \
      chown -R $SSH_USER:$SSH_USER /home/$SSH_USER/.ssh; \
      sed -i "s/^#*PasswordAuthentication .*/PasswordAuthentication no/" /etc/ssh/sshd_config; \
      sed -i "s/^#*PubkeyAuthentication .*/PubkeyAuthentication yes/" /etc/ssh/sshd_config; \
    fi; \
    /usr/sbin/sshd; \
    exec bun run be:start \
'