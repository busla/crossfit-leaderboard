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

// interface FooterTextProps {
//   fontSize?: string;
// }

export const Footer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between', // Distribute content evenly across the row
  alignItems: 'center', // Align items in the center vertically
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2), // Adds padding for spacing
  gap: theme.spacing(2), // Adds space between the items
  width: '100%', // Full width of the container
  flexWrap: 'wrap', // Allows content to wrap on smaller screens
  [theme.breakpoints.up('sm')]: {
    flexWrap: 'nowrap', // Ensures single row on larger screens
  },
}));

export const FooterText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  color: theme.palette.common.white,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}));

export const FooterImage = styled('img')(({ theme }) => ({
  height: '60px',
  width: 'auto',
  [theme.breakpoints.down('sm')]: {
    height: '40px',
  },
}));

export const LastUpdatedTypography = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.custom.softYellow,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  display: 'inline-block',
  color: theme.palette.common.black,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}));
