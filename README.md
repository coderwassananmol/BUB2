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

## Contribute

#### **Did you find a bug?**

* **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/coderwassananmol/BUB2/issues).

* If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/coderwassananmol/BUB2/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

#### **Did you write a patch that fixes a bug?**

* Open a new GitHub [pull request] (https://github.com/coderwassananmol/BUB2/compare) with the patch.

* Ensure the PR description clearly describes the problem and solution. Include the relevant issue number if applicable.

### Pull Request Process

* Fork the [repo](https://github.com/coderwassananmol/BUB2/issues)
* Clone your forked copy 
* Add the [repo](https://github.com/coderwassananmol/BUB2.git) as remote upstream.
* Follow the [setup instructions](https://github.com/coderwassananmol/BUB2#local-setup-instructions) to get your local copy working.
* Make changes as appropriate. 
* Pull updates from remote upstream.
* Push your changes to your forked repository.
* Make a PR with your updates.

## Keep Supporting
There was no Node.js wrapper available for Internet Archive, so I decided to write the Node implementation to upload books to Internet Archive. If you like this repository, show your support by starring the project. Cheers!
