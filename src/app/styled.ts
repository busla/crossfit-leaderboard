import {
  Typography,
  Box,
} from "@mui/material";
import { TypographyProps } from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const HeaderTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 700,
  color: '#ffffff',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `3px solid ${theme.palette.secondary.main}`,
  '& span': {
    fontWeight: 400,
    fontSize: '1rem', // Adjust as needed
  }
}));

interface FooterTextProps {
  fontSize?: string;
}

export const Footer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between', // Ensures left and right sections are spread apart
  alignItems: 'center',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2), // Optional: some padding for better spacing
  gap: theme.spacing(2), // Space between children within each section
  width: '100%', // Ensures the Footer takes full width
}));

export const FooterText = styled(Typography)<FooterTextProps>(({ theme, fontSize }) => ({
  fontSize: fontSize || '1rem',
  fontWeight: 500,
}));

export const LastUpdatedTypography = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.custom.softYellow,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  display: 'inline-block',
  color: theme.palette.common.black, // Set font color to black
}));
