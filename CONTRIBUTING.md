## Finding issues and new tasks
- All the issues and tasks are maintained on [Phabricator](https://phabricator.wikimedia.org/maniphest/?project=PHID-PROJ-wnkiea2sihld2xlpq527&statuses=open()&group=none&order=newest#R).
- Make sure to assign an issue to yourself from [Phabricator](https://phabricator.wikimedia.org/maniphest/?project=PHID-PROJ-wnkiea2sihld2xlpq527&statuses=open()&group=none&order=newest#R) before working on it.

## Fork
You are required to fork this repository and make changes on the forked repository on a new branch other than *develop* and after making all the changes, make a Pull Request to <b>develop branch</b>.
- After you have the project working on your local machine (refer [README.md](https://github.com/coderwassananmol/BUB2/blob/develop/README.md)), make sure you keep your fork up to date by tracking the original "upstream" repo that you forked. To do this, you'll need to add a remote:
    ```
    # Add 'upstream' repo to list of remotes
    $ git remote add upstream https://github.com/coderwassananmol/BUB2.git

    # Verify the new remote named 'upstream'
    $ git remote -v
    ```
- Whenever you want to update your fork with the latest upstream changes, take pull from the upstream repo to your fork in order to keep it at par with the main project by:
    ```
    $ git pull upstream develop
    ```
- Before making any contribution. Create seperate branch using command:
    ```
    # It will create a new branch with name Branch_Name and switch to that branch 
    $ git checkout -b Branch_Name
    ```
- After you've made changes or made your contribution to the project add changes to the branch you've just created by:
    ```
    # To add all new files to branch Branch_Name
    $ git add .
    ```
- Commit messages should follow a [certain guideline](https://udacity.github.io/git-styleguide/). To commit, give a descriptive message for the convenience of reveiwer by:
    ```
    # This message get associated with all files you have changed
    $ git commit -m 'message'
    ```
    **NOTE**: A PR should have only one commit. Multiple commits should be squashed.
- Now you are ready to push your work to the remote repository:
    ```
    # To push your work to your remote repository
    $ git push -u origin Branch_Name
    ```
## How to raise a pull request
- Create a Pull Request to merge your branch with the **develop branch** and mention the link to the **Phabricator ticket** you worked on in the description of the Pull Request.

## Code Reviews
- All submissions should come in the form of a PR and it must be reviewed by at least one reviewer before it gets merged.

## Did you find a bug?

* **Ensure the bug was not already reported** by searching on [Phabricator](https://phabricator.wikimedia.org/maniphest/?project=PHID-PROJ-wnkiea2sihld2xlpq527&statuses=open()&group=none&order=newest#R).

* If the bug is not already reported, create a **New Bug Report**. Make sure to include **title, clear description, tags**, and as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.


