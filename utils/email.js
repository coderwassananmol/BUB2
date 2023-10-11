module.exports = {
  emailtemplate: (title, success, uri) => {
    const email_success = `<!doctype html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>${title}</title>

		<style type="text/css">
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
			font-family: sans-serif;
		}
			strong{
			font-size: 2rem;
			}
			p{
			font-size: 1.5rem;
			}
			.file-content{
			margin: 2rem 0;
			}
			.button-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			width: 100%;
			}
			.button-content {
			width: 100px;
			height: 60px;
			border-radius: 3px;
			font-size: 18px;
			background-color: #447FF5 !important;
			}
			</style>
			</head>
			<body>

		<span class="cdx-card">
		<span class="cdx-card__text">
			<span class="cdx-card__text__title"><strong>Your file "${title}" has been uploaded to Internet Archive successfully!</strong>
			</span>
			<span class="cdx-card__text__description"> <div class='file-content'>
			<p>The file will now be converted by Internet Archive in various formats. Click on the button to
			view the
			uploaded
			file.</p>
		<p>Keep uploading!</p>
		<p>BUB v2.0</p>
			</div>
			<div class="button-container">
				<a title="View file" href="${uri}" target="_self">
					<button class="cdx-button cdx-button--action-progressive cdx-button--weight-primary button-content">View file</button>
				</a>
			</div> </span>
		</span>
		</span>

	</body> 
	</html>`;

    const email_failure = ` 
		<!doctype html>
		<html>
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<title>${title}</title>
		
				<style type="text/css">
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
						font-family: sans-serif;
					}
					strong{
					font-size: 2rem;
					}
					p{
					font-size: 1.5rem;
					}
					.file-content{
					margin: 2rem 0;
					}
			
					</style>
					</head>
			<body>
				<span class="cdx-card">
				<span class="cdx-card__text">
				<span class="cdx-card__text__title"><strong>Your file "${title}" was not uploaded to Internet Archive.</strong>
				</span>
				<span class="cdx-card__text__description"> <div class='file-content'>
				<p>Please try again later.</p>
				<p>Keep uploading!
				</p>
				<p>BUB v2.0</p>
				</div></span>
				</span>
				</span>
			</body> 
		</html>`;

    if (success) {
      return email_success;
    } else {
      return email_failure;
    }
  },
};
