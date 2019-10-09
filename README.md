## BUB2
A book uploader bot that transfers documents from public libraries such as Google Books, and Panjab Digital Library etc to Internet Archive. Built for Wikimedia Tool Labs.

## Local Setup instructions
1. Install [Node.js](https://nodejs.org/en/download/)
2. Install and setup Redis server on your machine.
3. Clone the repository
<br />`git clone https://github.com/coderwassananmol/BUB2`
4. Change the directory:
<br />`cd BUB2`
5. Checkout to develop branch:
<br /> `git checkout develop`
6. Run <br /> `npm install`
7. Start redis service in background.
8. Open `.env.example` in your editor and add the information and rename it to .env.
9. Run <br /> `npm run dev` for development and `npm run start` for production
10. Open your browser and run your local server: [http://localhost:3000](http://localhost:3000)

## Keep Supporting
There was no Node.js wrapper available for Internet Archive, so I decided to write the Node implementation to upload books to Internet Archive. If you like this repository, show your support by starring the project. Cheers!

## License
This project is licensed under the terms of the [MIT license](../master/LICENSE.md).
