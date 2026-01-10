import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'


const auth = async(request,response,next)=>{
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(' ')[1] 
        console.log('token is',token)
        if(!token){
            return response.status(401).json({message:"You are not logged in"})
        }
        try {
            
            const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
            request.userId = decoded.id
            request.user = await UserModel.findById(decoded.id).select("name email role")
            if(!request.user){
                return  response.status(401).json({
                    message:"User not found"
                })
            }

            next()

        } catch (error) {
                return response.status(401).json({ message: 'Invalid or expired access token' });

            
        }
       
        
    
}

export default auth