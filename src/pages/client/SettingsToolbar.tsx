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
import useTokenExternal from "@/hooks/useTokenExternal";
import { useNavigate } from "react-router-dom";

export type SettingsToolbarRef = {
  logout: () => void;
};

const SettingsToolbar = forwardRef<SettingsToolbarRef, { setEditMode: (value: boolean) => void }>(
  ({ setEditMode }, ref) => {
    const reset_token = useTokenDarwin(state => state.resetToken);
    const reset_tokenext = useTokenExternal(state => state.resetTokenExt);
    const token_ext = useTokenExternal(state => state.token_ext);
    const token_drw = useTokenDarwin(state => state.token_drw);
    const navigate = useNavigate();
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
      reset_tokenext();
      navigate("/login/client");
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
              {!token_drw && token_ext && (
                <ListItem>
                  <ListItemButton
                    onClick={() => {
                      setEditMode(true);
                      setOpen(false);
                    }}
                  >
                    <ListItemText primary="Edit" />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </Paper>
        </Popper>
      </>
    );
  }
);

export default SettingsToolbar;
