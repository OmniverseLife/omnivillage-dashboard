import React, { useState } from "react";
import "./navbar.css";
import { useLocation } from "react-router-dom";
import profile from "../../../assets/profile.png";
import {
  Box,
  Button,
  CircularProgress,
  FormLabel,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { change_password } from "../../../functions/admin";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, "New Password must be minimum of 8 digits")
    .required("Please enter password!"),
  confirm_password: yup
    .string()
    .min(8, "Confirm Password must be minimum of 8 digits")
    .required("Please enter confirm password!")
    .oneOf([yup.ref("password"), null], "Confirm Password doesn't match"),
});

export default function Navbar() {
  const location = useLocation();
  const paths = location.pathname.split("/");

  const [anchorEl, setAnchorEl] = useState(null);
  const [modal, setModal] = useState(false);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  let heading = paths[2]
    ? paths[2].replace("-", " & ") + " " + paths[1]
    : paths[1];

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: change_password,
    onSuccess: () => {
      toast.success("Password Changed Successfully!");
      setModal(false);
      reset();
    },
  });

  return (
    <div className="navbar">
      <div className="navbar-items">
        <h3 style={{ textTransform: "capitalize" }}>{heading}</h3>
        <div className="profile">
          <span onClick={(e) => setAnchorEl(e.currentTarget)}>
            <img src={profile} alt="" />
          </span>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            sx={{ marginTop: "5px" }}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                setModal(true);
              }}
              sx={{ fontSize: "14px" }}
            >
              Change Password
            </MenuItem>
          </Menu>
          {/* <div>
            <p>John Doe</p>
            <span>Production Manager</span>
          </div> */}
        </div>
      </div>
      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          reset();
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#fff",
            // border: "2px solid #000",
            outline: "none",
            borderRadius: "10px",
            boxShadow: 24,
            padding: "20px",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{
              marginBottom: "20px",
            }}
          >
            <Typography variant="h5" sx={{ color: "#333" }}>
              Change password
            </Typography>
            <IconButton
              onClick={() => {
                setModal(false);
                reset();
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Stack>
          <FormLabel>New Password</FormLabel>
          <TextField
            type="password"
            fullWidth
            size="small"
            sx={{ marginTop: "3px", marginBottom: "15px" }}
            {...register("password")}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />
          <FormLabel>Confirm Password</FormLabel>
          <TextField
            type="text"
            fullWidth
            size="small"
            sx={{ marginTop: "3px", marginBottom: "15px" }}
            {...register("confirm_password")}
            error={Boolean(errors.confirm_password)}
            helperText={errors.confirm_password?.message}
          />
          <Button
            type="button"
            variant="contained"
            sx={{ marginTop: "10px" }}
            onClick={handleSubmit((data) => mutate(data))}
            disabled={isPending}
          >
            Submit
            {isPending && (
              <CircularProgress
                color="inherit"
                size="14px"
                sx={{ marginLeft: "10px" }}
              />
            )}
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
