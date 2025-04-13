// pages/_error.js
function Error({ statusCode }) {
    return (
        <div>
            <h1>{statusCode ? `${statusCode} エラーが発生しました。` : 'エラーが発生しました。'}</h1>
        </div>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
