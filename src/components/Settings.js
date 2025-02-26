import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Alert
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { api } from '../services/api';

const currencies = [
  { value: 'USD', label: '$ - US Dollar' },
  { value: 'EUR', label: '€ - Euro' },
  { value: 'GBP', label: '£ - British Pound' },
  { value: 'KES', label: 'KSh - Kenyan Shilling' },
  { value: 'UGX', label: 'USh - Ugandan Shilling' },
  { value: 'TZS', label: 'TSh - Tanzanian Shilling' }
];

function Settings({ open, onClose, settings, onSave, type }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [bankLogo, setBankLogo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = async (event, type) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (type === 'company') {
          setCompanyLogo(e.target.result);
          setLocalSettings(prev => ({
            ...prev,
            companyLogo: e.target.result
          }));
        } else {
          setBankLogo(e.target.result);
          setLocalSettings(prev => ({
            ...prev,
            bankLogo: e.target.result
          }));
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      const response = type === 'bank' 
        ? await api.updateBankProfile(localSettings)
        : await api.updateCompanyProfile(localSettings);
      
      onSave(response.profile);
      onClose();
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Currency"
              name="currency"
              value={localSettings.currency || 'USD'}
              onChange={handleChange}
            >
              {currencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {type === 'bank' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankName"
                value={localSettings.bankName || ''}
                onChange={handleChange}
              />
            </Grid>
          )}

          {type === 'payslip' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={localSettings.companyName || ''}
                onChange={handleChange}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Period From"
              name="periodFrom"
              value={localSettings.periodFrom || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Period To"
              name="periodTo"
              value={localSettings.periodTo || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              {type === 'payslip' ? 'Company Logo' : 'Bank Logo'}
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id={`${type}-logo-upload`}
              type="file"
              onChange={(e) => handleLogoChange(e, type === 'payslip' ? 'company' : 'bank')}
            />
            <label htmlFor={`${type}-logo-upload`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload Logo
              </Button>
            </label>
            {((type === 'payslip' && companyLogo) || (type === 'bank' && bankLogo)) && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={type === 'payslip' ? companyLogo : bankLogo}
                  alt={`${type} logo`}
                  style={{ maxWidth: '200px', maxHeight: '100px' }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function SettingsButton({ onClick }) {
  return (
    <IconButton 
      onClick={onClick}
      sx={{ 
        position: 'absolute',
        top: 8,
        right: 8
      }}
    >
      <SettingsIcon />
    </IconButton>
  );
}

export default Settings;
