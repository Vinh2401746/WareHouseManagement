import { toast, Slide } from 'react-toastify';



const dispatchToast = (
  type: "success" | "info" | "error" | "warning" ,
  message: string,
) => {
  toast[type](message, {
    position: 'top-right',
    transition: Slide,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light',
  });
};

export default dispatchToast;
