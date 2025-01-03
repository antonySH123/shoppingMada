import {FaFacebook,FaLinkedin,FaInstagram,FaGooglePlus} from 'react-icons/fa'

function Footer() {
  return (
    <div className='h-40 bg-green-500 flex flex-col justify-center gap-5'>
      <div className='w-full flex justify-center items-center gap-4'>
        <div className='border  border-white-100 rounded-full text-white flex justify-center items-center w-12 h-12'>
            <FaFacebook/>
        </div>
        <div className='border border-white-100 rounded-full text-white flex justify-center items-center w-12 h-12'>
            <FaLinkedin/>
        </div>
        <div className='border border-white-100 rounded-full text-white flex justify-center items-center w-12 h-12'>
            <FaInstagram/>
        </div>
        <div className='border border-white-100 rounded-full text-white flex justify-center items-center w-12 h-12'>
            <FaGooglePlus/>
        </div>
      </div>
      <div className='w-full flex justify-center items-center'>
        <p className='text-white'>&copy;Copyright 2024 ShoppingMada</p>
      </div>
    </div>
  )
}

export default Footer
