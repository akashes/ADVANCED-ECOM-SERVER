import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'

const generateRefreshToken=async(userId)=>{
    const token = await jwt.sign(
        {id:userId},
        process.env.REFRESH_SECRET,
        {expiresIn:'7d'})

        const updateRefreshToken = await UserModel.updateOne(
            {_id:userId},
            {$set:{refresh_token:token}})
        return token
    
}

export default generateRefreshToken