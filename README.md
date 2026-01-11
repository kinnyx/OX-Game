## Run DB
docker compose -f ox-game-docker/docker-compose.yml up -d

## Migrate
npx prisma migrate dev

## Dev
npm run dev
