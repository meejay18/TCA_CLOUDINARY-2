const userModel = require('../model/userModel')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')

exports.signUp = async (req, res) => {
  const files = req.files
  const { firstName, lastName, email } = req.body
  try {
    // check if the user exists
    const checkUser = await userModel.findOne({ email: email.toLowerCase() })
    if (checkUser) {
      if (files?.profilePicture) {
        fs.unlinkSync(files.profilePicture[0].path)
      }
      if (files?.gallery) {
        files.gallery.forEach((el) => fs.unlinkSync(el.path))
      }
      return res.status(400).json({
        message: 'user already exists',
      })
    }

    // upload profile image to cloudinary
    let profilePicture = null
    if (files?.profilePicture) {
      const profileimg = files.profilePicture[0]
      const profileImageResource = await cloudinary.uploader.upload(profileimg.path)
      profilePicture = {
        url: profileImageResource.secure_url,
        publicId: profileImageResource.public_id,
      }
      fs.unlinkSync(profileimg.path)
    }

    // upload gallery(multiple pictures) to cloudinary
    const galleryImageResource = []

    // iterate through files
    if (files?.gallery) {
      for (const images of files.gallery) {
        const cloudinaryImages = await cloudinary.uploader.upload(images.path)
        const galleryImages = {
          url: cloudinaryImages.secure_url,
          publicId: cloudinaryImages.public_id,
        }
        // push the galery images into the new array
        galleryImageResource.push(galleryImages)
        // clean up files locally
        fs.unlinkSync(images.path)
      }
    }

    const data = {
      firstName,
      lastName,
      email: email?.toLowerCase(),
      displayPicture: profilePicture,
      gallery: galleryImageResource,
    }

    // create new user
    const newUser = new userModel(data)
    const savedUser = await newUser.save()

    return res.status(201).json({
      message: 'sign up successfull',
      data: savedUser,
    })
  } catch (error) {
    // if there is an error delete images
    if (req.files?.profilePicture) {
      fs.unlinkSync(req.files?.profilePicture[0].path)
    }
    if (req.files?.gallery) {
      req.files?.gallery.forEach((el) => fs.unlinkSync(el.path))
    }

    return res.status(500).json({
      message: 'Error signing up',
      error: error.message,
    })
  }
}

exports.updateUser = async (req, res) => {
  const { userId } = req.params
  const { firstName, lastName, email } = req.body

  const files = req.files
  try {
    const user = await userModel.findById(userId)
    // check if user exists
    if (!user) {
      if (files?.profilePicture) {
        // delete profilepicture locally
        fs.unlinkSync(files?.profilePicture[0].path)
      }
      if (files?.gallery) {
        // iterate and delete gallery locally
        files?.gallery.forEach((el) => fs.unlinkSync(el.path))
      }
      return res.status(404).json({
        message: 'user not found',
      })
    }

    let profilePic = files.profilePicture[0].path
    let profilePicUpload = await cloudinary.uploader.upload(profilePic)

    const profileimg = {
      url: profilePicUpload.secure_url,
      publicId: profilePicUpload.public_id,
    }
    fs.unlinkSync(profilePic)

    // delete old gallery images from cloudinary
    if (files?.gallery) {
      if (user?.gallery && user?.gallery.length > 0) {
        for (const img of user.gallery) {
          await cloudinary.uploader.destroy(img.publicId)
        }
      }
    }

    // upload  gallery images to cloudinary
    const newGalleryImages = []

    for (const image of files?.gallery) {
      const cloudUpload = await cloudinary.uploader.upload(image.path)
      const newImage = {
        url: cloudUpload.secure_url,
        publicId: cloudUpload.public_id,
      }

      newGalleryImages.push(newImage)
      fs.unlinkSync(image.path)
    }

    const data = { firstName, lastName, email, displayPicture: profileimg, gallery: newGalleryImages }

    // update user
    const updatedUser = await userModel.findByIdAndUpdate(userId, data, { new: true })
    return res.status(200).json({
      message: 'user updated successfully',
      data: updatedUser,
    })
  } catch (error) {
    // when there is an error delete files locally
    if (req?.files.profilePicture) {
      fs.unlinkSync(req?.files.profilePicture[0].path)
    }
    if (req?.files.gallery) {
      req.files.gallery.forEach((el) => fs.unlinkSync(el.path))
    }
    return res.status(500).json({
      message: 'Error updating user',
      error: error.message,
    })
  }
}
