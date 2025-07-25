import jwt from 'jsonwebtoken'


const generateAccessToken = async(userId) => {
    const token = await jwt.sign(
        {id:userId},
        process.env.ACCESS_SECRET,
        {expiresIn:'5h'})
    return token
    
}

export default generateAccessToken