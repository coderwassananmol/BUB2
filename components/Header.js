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
                crossOrigin="anonymous" />

            <link
                rel="stylesheet"
                href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css"
                integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"
                crossOrigin="anonymous" />
            <link 
                href="https://fonts.googleapis.com/css?family=Montserrat:300|Open+Sans:300|Raleway:300" 
                rel="stylesheet" />

        </Head>
        <nav className="navbar navbar-default">
            <div className="container-fluid">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                </div>

                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul className="nav navbar-nav">
                        <li className={props.page === 'index' ? 'active' : null}><Link href="/"><a>Upload<span className="sr-only">(current)</span></a></Link></li>
                        {/* <li className={props.page === 'queue' ? 'active' : null}><Link href="/queue/1"><a>Queue</a></Link></li> */}
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        <li className="dropdown">
                            <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Help<span className="caret"></span></a>
                            <ul className="dropdown-menu">
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">About</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <div className="panel panel-primary">
            <div className="panel-heading">
                <p className="panel-title">Book Uploader Bot (BUB) v2.0</p>
            </div>
            <div className="panel-body">
            <p>A bot that helps you transfer books that belong to <b>public domain</b> to Internet Archive from libraries like Google Books, West Bengal State Library etc.</p>
            <p>Using IA Upload Tool, you can then transfer these books to Wikimedia Commons.</p>
            </div>
        </div>
    </div>
);

export default Header;
