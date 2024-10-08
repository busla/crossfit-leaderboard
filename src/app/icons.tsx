import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { Box, Typography } from '@mui/material';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TimerIcon from '@mui/icons-material/Timer';
import RepeatIcon from '@mui/icons-material/Repeat';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import GroupIcon from '@mui/icons-material/Group';

interface IconWithLabelProps {
  icon: React.ElementType<SvgIconProps>;
  label?: string;
  iconProps?: SvgIconProps;
}

const IconWithLabel: React.FC<IconWithLabelProps> = ({ icon: Icon, label, iconProps }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon {...iconProps} />
      {label && <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>}
    </Box>
  );
};

interface HeaderConfig {
  translation: string;
  icon?: React.ComponentType;
  showLabel: boolean;
}

const headerConfig: { [key: string]: HeaderConfig } = {
  "Division": { translation: "Undirflokkur", icon: GroupIcon, showLabel: false },
  "Athlete": { translation: "Keppandi", icon: PersonIcon, showLabel: true },
  "Total": { translation: "Heildarstig", icon: ScoreboardIcon, showLabel: false },
  "Rank": { translation: "Sæti", icon: EmojiEventsIcon, showLabel: false },
  "All": { translation: "Allir", showLabel: true },
  "Men": { translation: "Karlar", showLabel: true },
  "Women": { translation: "Konur", showLabel: true },
  'WOD 1A (mín)': { translation: "W1A", icon: TimerIcon, showLabel: true },
  'WOD 1B (kg)': { translation: "W1B", icon: FitnessCenterIcon, showLabel: true },
  'WOD 2 (mín)': { translation: "W2", icon: TimerIcon, showLabel: true },
  'WOD 3 (reps)': { translation: "W3", icon: RepeatIcon, showLabel: true },
  'Heildarstig': { translation: "Heildarstig", icon: ScoreboardIcon, showLabel: true },
};

export { IconWithLabel, headerConfig }
