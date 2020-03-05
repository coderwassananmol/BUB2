Welcome to <b>Book Uploader Bot (BUB)</b> Project. This file demonstrates the contributing guidelines that every developer/mentor has to adhere for GirlScript Summer of Code'20. This is required in order to create a unified development environment. Let's start.

## The Git Workflow
The workflow that we'll be using is <b> Dev - Staging - Production</b>. All the Pull Request (PR's) will be made to <b>develop</b> branch.
The mentors shall review the PR. If any change is required in the PR, the mentors shall comment on the PR itself else if
everything is good, the mentors will merge the PR to the develop branch.<br />
To read more about this workflow, you can visit [this link](http://guides.beanstalkapp.com/deployments/best-practices.html).

## Fork
<b>It is strictly for the participants. Please read it carefully.</b><br />
Every participant(s) is required to fork this repository and make changes on the forked repository on a new branch other than *develop* and after making all the changes, make a Pull Request to <b>devlop branch</b>.

- After you have the project working on your local maching (refer [README.md](https://github.com/coderwassananmol/BUB2/blob/develop/README.md)), in order to make sure you keep your fork up to date by tracking the original "upstream" repo that you forked. To do this, you'll need to add a remote:
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
To commit give a descriptive message for the convenience of reveiwer by:
    ```
    # This message get associated with all files you have changed
    $ git commit -m 'message'
    ```
- Now you are ready to your work to the remote repository
    ```
    # To push your work to your remote repository
    $ git push -u origin Branch_Name
    ```

Go to your repository in browser and click on compare and pull requests. Then add a title(Please mention the #issue_no you've been working on) and description(link the issue) to your pull request that explains your contribution.

## Issue creation
<b>It is strictly for the admin and mentors. Please read it carefully. </b><br />
Mentors and admin are requested to make issues and mark them with GSSoC20 label. Add separate labels like beginner, easy, medium, hard and taken. If a particular issue is assigned to someone mark it as taken. If that person does not respond or show any progress within 2-3 days remove the taken tag.

Please reach out to any of the below mentors for any help. Happy Contributing!

[@coderwassananmol](http://github.com/coderwassananmol) (Project Admin)
[@ankitjena](https://github.com/ankitjena) (Mentor)
[@Mohit](https://github.com/mksharma1/) (Mentor)
[@Parikshit](https://github.com/Parikshit-Hooda) (Mentor)
[@Ramakrishna](https://github.com/rkpattnaik780) (Mentor)
[@Rajat](https://github.com/rajat2502) (Mentor)
[@Sahil](https://github.com/sahilbansal17) (Mentor)
