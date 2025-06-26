FROM oven/bun

WORKDIR /usr/src/idle-rpg

COPY . .
RUN bun setup

VOLUME ["/src/back-end/core/db"]

EXPOSE 4000
CMD ["bun", "run", "be:start"]