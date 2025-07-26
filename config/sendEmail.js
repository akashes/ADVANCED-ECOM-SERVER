import { sendEmail } from "./emailService.js";

 const sendEmailFun=async(to,subject,text,html)=>{
    console.log(to,subject,text)
    const result = await sendEmail(to,subject,text,html)
    console.log(result)
    if(result.success){
        return true;

    }else{

        return false;
    }
}

export default sendEmailFun