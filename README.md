# File Sharing

## Run the application

### Requirements
- Docker (you can install it using the link: https://docs.docker.com/engine/install/).
- Git, to clone this repository (https://git-scm.com/downloads).
- Node (v20.9.0)

### Setup
1. Clone this repository: `git clone https://github.com/Ivblackking/test_filesharing.git` .
   
2. In the repo directory create a `.env` file. Use the next template:
   ```
    WEB_MYSQL_DB="filesharingdb"
    WEB_MYSQL_USER="filesharinguser"
    WEB_MYSQL_PASSWORD="filesharingpasswd"
    WEB_MYSQL_ROOT_PASSWORD="rootpasswd"
    WEB_MYSQL_TCP_PORT=3306

    WEBAPP_PORT=8000
    ADMIN_KEY="filesharing_admin"
    SECRET_KEY="fastapi-secret"
    JWT_ALGORITHM="HS256"

    REACTAPP_PORT=3000
   ``` 
3. Run a terminal in the repo directory. In the terminal run the next command:<br />
   `docker compose -f docker-compose-dev.yml up --build`.<br />
   Ensure that all containers have started successfully.
   
4. In other terminal run comands:<br />
   `cd frontend`.<br />
   `npm install`.<br />
   `npm start`.<br />
   
5. Now you can use the app by following the link: http://localhost:3000 .