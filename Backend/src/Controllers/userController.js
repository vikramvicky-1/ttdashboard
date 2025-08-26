import User from "../Models/userModel.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // Handle profile picture upload
    let profilePicture = null;
    if (req.file) {
      profilePicture = req.file.filename;
    }
    
    // Create new user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'staff',
      profilePicture
    };
    
    const user = new User(userData);
    await user.save();
    
    // Return user without password
    const userResponse = user.toJSON();
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Delete uploaded file if user creation fails
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400).json({
      success: false,
      message: "Failed to create user",
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    
    // Find user
    const user = await User.findById(id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user"
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role;
    
    // Handle password update
    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long"
        });
      }
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Handle profile picture update
    if (req.file) {
      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldFilePath = path.join(process.cwd(), 'uploads', user.profilePicture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.profilePicture = req.file.filename;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Delete uploaded file if update fails
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findById(id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Soft delete - set isActive to false
    await User.findByIdAndUpdate(id, { isActive: false });
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};

// Hard delete user (permanently remove from database)
export const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Delete profile picture file if exists
    if (user.profilePicture) {
      const filePath = path.join(process.cwd(), 'uploads', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Permanently delete user
    await User.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "User permanently deleted"
    });
  } catch (error) {
    console.error("Error hard deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user permanently",
      error: error.message
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle user status",
      error: error.message
    });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['staff', 'accountant', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be staff, accountant, or admin"
      });
    }
    
    const users = await User.find({ role, isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users,
      count: users.length,
      role
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users by role",
      error: error.message
    });
  }
};
