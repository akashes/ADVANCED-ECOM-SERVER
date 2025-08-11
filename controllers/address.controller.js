
import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
export const addAddress=async(request,response)=>{
    try {
        const userId = request.userId
         const {
      address_line,
      city,
      state,
      country,
      pincode,
      mobile,
      landmark,
      address_type
    } = request.body;
     if (!address_line || !pincode || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Address line, pincode, and mobile are required',
      });
    }
    const address = new AddressModel({
      address_line,
      city,
      state,
      country,
      pincode,
      mobile,
      userId,
      landmark,
      address_type
    });
   await address.save();

    //saving in user model
  const updateCartUser = await UserModel.updateOne(
    { _id: userId },
    { $push: { address_details: address._id } }
  )
    return response.status(201).json({
      success: true,
      message: 'Address added successfully',
       address,
    });
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}

export const getAddressController=async(request,response)=>{
  try {
    console.log('inside get address controller')
    const address = await AddressModel.find({userId:request.query?.userId})
    if(!address){
      return response.status(400).json({
        error:true,
        success:false,
        message:"address not found"
      })
    }
    return response.status(200).json({
      error:false,
      success:true,
      address
    })
    
  } catch (error) {
    return response.status(500).json({
        message:error.message||error,
        error:true,
        success:false
    })

    
  }
}

// export const selectAddressController=async(request,response)=>{
//   console.log(request.body.selected)
//   console.log(request.params.addressId)
//   try {
 
//     // const updateAddress = await UserModel.updateOne(
//     //   { _id: userId },
//     //   { $set: { selected_address: addressId } }
//     // );
//     const addressId = request.params.addressId
//     const address = await AddressModel.findById(addressId)
//     if(!address){
//       return response.status(400).json({
//         message:"Address not found",
//         success:false,
//         error:true
//       })
//     }
//     await AddressModel.updateMany({userId:address.userId},{selected:false})

//     const updateAddress = await AddressModel.findByIdAndUpdate(

//       addressId,
//       {
//         selected:request?.body?.selected
//       },
//       {
//         new: true
//       }
//     )
//     console.log(updateAddress)
//     return response.status(200).json({
//       message:"Address selected successfully",
//       success:true,
//       error:false,
//       address:updateAddress
//     })
    
//   } catch (error) {
//     console.log(error)
//     return response.status(500).json({
//         message:error.message||error,
//         error:true,
//         success:false
//     })
    
//   }
// }

export const deleteAddress=async(request,response)=>{
  try {
    const addressId = request.params.addressId
    const address = await AddressModel.findById(addressId)
    if(!address){
      return response.status(400).json({
        message:"Address not found",
        success:false,
        error:true
      })
    }
    await AddressModel.findByIdAndDelete(addressId)
    return response.status(200).json({
      message:"Address deleted successfully",
      success:true,
      error:false,
      addressId
    })
    
  } catch (error) {
    return response.status(500).json({
        message:error.message||error,
        error:true,
        success:false
    })
    
  }
}