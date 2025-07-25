import jwt from 'jsonwebtoken'


const auth = async(request,response,next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(' ')[1] 
        console.log(token)
        if(!token){
            return response.status(401).json({message:"Provide token"})
        }
        const decoded = jwt.verify(token,process.env.ACCESS_SECRET)
        console.log(decoded)
        if(!decoded){
            return response.status(401).json({
                message:"unauthorized access",
                error:true,
                success:false
            })

        }
        request.userId = decoded.id
        next()
        
    } catch (error) {
        return response.status(500).json({
            message:'You are not logged in',
            error:true,
            success:false
        })
        
    }
}

export default auth