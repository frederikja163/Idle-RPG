FROM oven/bun

WORKDIR /usr/src/idle-rpg

COPY . .
RUN bun setup

EXPOSE 4000
CMD ["bun", "run", "be:start"]