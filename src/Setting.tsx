import { Box, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { DisplayMode } from "./CommonAppTypes";

type SettingProps = {
  initialDisplayMode: DisplayMode,
  onDisplayModeChange: (mode: DisplayMode) => void,
};

export const Setting: React.FC<SettingProps> = ({ initialDisplayMode, onDisplayModeChange }) => {

  return (
    <Box sx={{ margin: "0 1em 0 1em" }}>
      <Typography>ディスプレイモード</Typography>
      <RadioGroup
        row
        value={initialDisplayMode}
        onChange={(newValue) => {
          onDisplayModeChange(newValue.currentTarget.value as DisplayMode);
        }}
      >
        <FormControlLabel value="system" control={<Radio />} label="システム" />
        <FormControlLabel value="light" control={<Radio />} label="ライト" />
        <FormControlLabel value="dark" control={<Radio />} label="ダーク" />
      </RadioGroup>
    </Box>
  )
}
