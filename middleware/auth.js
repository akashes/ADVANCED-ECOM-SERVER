import jwt from 'jsonwebtoken'


const auth = async(request,response,next)=>{
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(' ')[1] 
        console.log(token)
        if(!token){
            return response.status(401).json({message:"You are not logged in"})
        }
        try {
            
            const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
            request.userId = decoded.id
            next()

        } catch (error) {
                return response.status(401).json({ message: 'Invalid or expired access token' });

            
        }
       
        
    
}

export default auth