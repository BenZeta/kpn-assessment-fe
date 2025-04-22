import {
  Paper,
  IconButton,
  Popper,
  List,
  ListItemText,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import { forwardRef, useImperativeHandle, useState } from "react";
import useTokenDarwin from "@/hooks/useTokenDarwin";

export type SettingsToolbarRef = {
  logout: () => void;
};

const SettingsToolbar = forwardRef<SettingsToolbarRef, {}>((_, ref) => {
  const reset_token = useTokenDarwin(state => state.resetToken);
  useImperativeHandle(ref, () => ({
    logout: logout,
  }));

  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const onClick = (anchor: HTMLButtonElement) => {
    setAnchor(anchor);
  };

  const logout = () => {
    reset_token();
    location.replace("https://kpncorporation.darwinbox.com/");
  };

  return (
    <>
      <IconButton
        onClick={e => {
          onClick(e.currentTarget);
          setOpen(prev => !prev);
        }}
      >
        <Settings />
      </IconButton>
      <Popper open={open} anchorEl={anchor} placement="top">
        <Paper>
          <List disablePadding>
            <ListItem>
              <ListItemButton
                onClick={() => {
                  logout();
                }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>
      </Popper>
    </>
  );
});

export default SettingsToolbar;
