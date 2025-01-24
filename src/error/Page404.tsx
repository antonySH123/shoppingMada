import React from "react";

function Page404() {
  return (
    <React.Fragment>
      <section className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold text-gray-600">404</h1>
        <h2 className="text-4xl font-semibold text-gray-600">Page Not Found</h2>
        <p className="text-gray-600">The page you are looking for does not exist.</p>
        <p className="text-gray-600">Please check the URL and try again.</p>
        <p className="text-gray-600">Thank you.</p>
      </section>
    </React.Fragment>
  );
}

export default Page404;
