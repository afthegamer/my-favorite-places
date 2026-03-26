.PHONY: start up upD down down-v logs ps restart \
        test test-server test-client test-e2e \
        dev-server dev-client install clean

start:
	docker compose start

up:
	docker compose up --build

upD:
	docker compose up --build -d

down:
	docker compose down

down-v:
	docker compose down -v

logs:
	docker compose logs -f

ps:
	docker compose ps

restart: down up

test: test-server test-client

test-server:
	cd server && npm test

test-client:
	cd client && npm test

test-e2e:
	cd e2e && npm test

dev-server:
	cd server && npm run dev

dev-client:
	cd client && npm run start

install:
	cd server && npm install
	cd client && npm install
	cd e2e && npm install

clean:
	cmd /c "if exist server\node_modules rd /s /q server\node_modules"
	cmd /c "if exist server\dist rd /s /q server\dist"
	cmd /c "if exist client\node_modules rd /s /q client\node_modules"
	cmd /c "if exist client\dist rd /s /q client\dist"
	cmd /c "if exist e2e\node_modules rd /s /q e2e\node_modules"
