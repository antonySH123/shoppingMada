import {FaAddressBook,FaPhone} from 'react-icons/fa'
function Contact() {
  return (
    <section className="py-5 h-auto" id='contact'>
      <div className="container px-10 mx-auto py-5 ">
        <h1 className="text-center text-4xl font-thin my-5">Nous contacter</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 px-5 py-4 gap-4">
            {/* <h1>Eto ilay Maps</h1> */}
            <div className="border  h-80">
              <div className='flex items-center px-5 text-5xl h-28 text-gray-700'>
                <FaAddressBook/>
              </div>
              <div className='px-5'>
                <h3 className='font-bold text-2xl text-gray-700'>Adresse</h3>
                <p>67ha ouest</p>
                <p>Coum</p>
              </div>
            </div>
            <div className="border  h-80">
              <div className='flex items-center px-5 text-5xl h-28 text-gray-700'>
                <FaPhone/>
              </div>
              <div className='px-5'>
                <h3 className='font-bold text-2xl text-gray-700'>Appelez nous</h3>
                <p>67ha ouest</p>
                <p>Coum</p>
              </div>
            </div>
          </div>
          <div className="form w-full">
            <form action="" method="post" className="py-5 w-full flex flex-col">
              <div className="mb-3 w-full">
                <input
                  type="text"
                  className="w-full h-10 px-5 py-5  border "
                  placeholder="Votre nom"
                />
              </div>
              <div className="mb-3 w-full">
                <input
                  type="text"
                  className="w-full h-10 px-5 py-5  border"
                  placeholder="Adresse email"
                />
              </div>
              <div className="mb-3 w-full">
                <input
                  type="text"
                  className="w-full h-10 px-5 py-5  border"
                  placeholder="Sujet"
                />
              </div>
              <div className="mb-3 w-full sm:w-auto">
                <textarea
                  name=""
                  id=""
                  className="px-5 py-5 w-full border"
                  placeholder="Votre message"
                  cols={76}
                  rows={5}
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white block w-36 h-8"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
