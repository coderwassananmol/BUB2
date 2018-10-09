import Head from 'next/head';
import Link from 'next/link';

const Header = (props) => (
    <div>
        <Head>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"></meta>
            <link
                rel="stylesheet"
                href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
                integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
                crossorigin="anonymous" />

            <link
                rel="stylesheet"
                href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css"
                integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"
                crossorigin="anonymous" />
        </Head>
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                </div>

                <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul class="nav navbar-nav">
                        <li class={props.page === 'index' ? 'active' : null}><Link href="/"><a>Upload<span class="sr-only">(current)</span></a></Link></li>
                        <li class={props.page === 'queue' ? 'active' : null}><Link href="/queue"><a>Queue</a></Link></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Help<span class="caret"></span></a>
                            <ul class="dropdown-menu">
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">About</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <div class="panel panel-primary">
            <div class="panel-heading">
                <p class="panel-title">Book Uploader Bot (BUB) v2.0</p>
            </div>
            <div class="panel-body">
            <p>A bot that helps you transfer books that belong to <b>public domain</b> to Internet Archive from libraries like Google Books, West Bengal State Library etc.</p>
            <p>Using IA Upload Tool, you can then transfer these books to Wikimedia Commons.</p>
            </div>
        </div>
    </div>
);

export default Header;
