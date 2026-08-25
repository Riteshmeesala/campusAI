import React, { useState, useRef } from 'react';
import {
  Box, Avatar, IconButton, Typography, Tooltip,
  CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  CameraAltOutlined, DeleteOutline, CloudUploadOutlined,
  PersonOutline
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function ProfilePhotoUploader({
  targetUser,
  onImageUpdated,
  size = 96,
  editable = true,
}) {
  const { user: currentUser, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);

  const isOwnProfile = String(targetUser?.id) === String(currentUser?.id);
  const canEdit = editable && (isOwnProfile || currentUser?.role === 'ADMIN');
  const profileImage = targetUser?.profileImage;

  // Compress & resize image to clean ~350x350 Data URL
  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 360;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with 0.88 quality for compact size
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit original file size to 8MB
    if (file.size > 8 * 1024 * 1024) {
      toast.warning('Image file size must be under 8MB.');
      return;
    }

    setUploading(true);
    setAnchorEl(null);

    try {
      const dataUrl = await processImageFile(file);

      if (isOwnProfile) {
        await userAPI.updateProfileImage(dataUrl);
        updateUser({ profileImage: dataUrl });
      } else {
        await userAPI.updateUser(targetUser.id, { profileImage: dataUrl });
      }

      if (onImageUpdated) onImageUpdated(dataUrl);
      toast.success('Profile photo updated successfully!');
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error('Failed to update profile photo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    setAnchorEl(null);

    try {
      if (isOwnProfile) {
        await userAPI.updateProfileImage(null);
        updateUser({ profileImage: null });
      } else {
        await userAPI.updateUser(targetUser.id, { profileImage: null });
      }

      if (onImageUpdated) onImageUpdated(null);
      toast.success('Profile photo removed.');
    } catch (err) {
      console.error('Photo remove error:', err);
      toast.error('Failed to remove photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />

      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          cursor: canEdit ? 'pointer' : 'default',
          '&:hover .photo-overlay': {
            opacity: canEdit ? 1 : 0,
          },
        }}
        onClick={(e) => {
          if (canEdit && !uploading) {
            setAnchorEl(e.currentTarget);
          }
        }}
      >
        <Avatar
          src={profileImage}
          sx={{
            width: size,
            height: size,
            bgcolor: COLORS.primary,
            color: '#ffffff',
            fontSize: size * 0.38,
            fontWeight: 700,
            borderRadius: 0.5,
            border: `2px solid ${COLORS.border}`,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
          }}
        >
          {targetUser?.name?.charAt(0) || targetUser?.username?.charAt(0) || 'U'}
        </Avatar>

        {/* Hover/Touch Overlay */}
        {canEdit && (
          <Box
            className="photo-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: 0.5,
              bgcolor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              color: '#ffffff',
            }}
          >
            {uploading ? (
              <CircularProgress size={24} sx={{ color: '#ffffff' }} />
            ) : (
              <>
                <CameraAltOutlined sx={{ fontSize: 22, mb: 0.25 }} />
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600 }}>Change</Typography>
              </>
            )}
          </Box>
        )}

        {/* Small corner edit badge */}
        {canEdit && !uploading && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: '#ffffff',
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              color: COLORS.textPrimary,
            }}
          >
            <CameraAltOutlined sx={{ fontSize: 13 }} />
          </Box>
        )}
      </Box>

      {/* Menu Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 0.5,
            mt: 0.5,
            minWidth: 160,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            fileInputRef.current?.click();
          }}
          sx={{ fontSize: '0.8125rem', py: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: COLORS.primary }}>
            <CloudUploadOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Upload New Photo" />
        </MenuItem>

        {profileImage && (
          <MenuItem
            onClick={handleRemovePhoto}
            sx={{ fontSize: '0.8125rem', py: 1, color: '#dc2626' }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: '#dc2626' }}>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Remove Photo" />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
