## BUB2
A book uploader bot that transfers documents from public libraries such as Google Books, and Panjab Digital Library etc to Internet Archive. Built for Wikimedia Tool Labs. Check out [BUB2 on Toolforge](https://bub2.toolforge.org)!

## Getting Started
1. Install [Node](https://nodejs.org/en/download/). Check for Node and NPM correct install using `node -v` and `npm -v` on the terminal.
2. Install [Docker toolbox](https://docs.docker.com/toolbox/toolbox_install_windows/).
3. Start redis service in the background 
* Using Docker :
`docker run --name redis -p 6379:6379 redis` and `docker start redis` . 

* Using `docker-compose` : 
`docker-compose up -d` and `docker-compose start`
4. Note: In order to send email through gmail, you may need to allow less secure app access. To turn it on, go to https://myaccount.google.com/lesssecureapps?pli=1
5. Clone the repository `git clone https://github.com/coderwassananmol/BUB2`
6. Navigate to the project directory on the terminal: `cd BUB2`.
7. For developers, checkout to develop branch: `git checkout develop`
8. Run `npm install`
9. Open `.env.example` file in your editor. Rename it to `.env`. To fill the information in the `.env` file - follow the following steps:
9.1. Make an account on [archive.org](https://archive.org) and note down the sign-in credentials. Using these details, fill 'email' and 'password' fields in the `.env` file.
9.2. Go to https://archive.org/account/s3.php . Generate the **access** and **secret** keys and fill them in the `.env` file in the corresponding fields.
9.3. Go to [Google Developers console](https://console.developers.google.com/getting-started). Make a new project to run the app. In that Google Developers project, search for 'Books API' in the Google API console, then **enable** the API for the project, then generate the **API keys**, and then copy and paste the API key in the `GB_Key` field.
9.4. Fill the `redishost` field with **docker** .
9.5. Fill the `redisport` field with **6379**, which is the default port number for redis.
9.6. Fill `service` field with **gmail**.
10. Run `npm run dev` for development and `npm run start` for production.
11. Open your browser and run your local server: http://localhost:5000

## Keep Supporting
There was no Node.js wrapper available for Internet Archive, so I decided to write the Node implementation to upload books to Internet Archive. If you like this repository, show your support by starring the project. Cheers!
