import React from "react";

function Page404() {
  return (
    <React.Fragment>
      <section className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold text-gray-600">404</h1>
        <h2 className="text-4xl font-semibold text-gray-600">Page introuvable</h2>
        <p className="text-gray-600">La page que vous recherchez n’existe pas.</p>
        <p className="text-gray-600">Vérifiez l’adresse et réessayez.</p>
        <p className="text-gray-600">Merci.</p>
      </section>
    </React.Fragment>
  );
}

export default Page404;
