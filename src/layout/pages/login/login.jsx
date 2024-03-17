import styled from "@emotion/styled";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import logo from "../../../assets/logo.png";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../../functions/admin";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const LoginWrapper = styled(Stack)`
  min-height: 100vh;
  width: 100vw;
  font-family: "Montserrat", sans-serif;
  .MuiCardContent-root {
    min-width: 350px;
    .logo {
      margin-bottom: 15px;
      img {
        width: 40px;
        height: 40px;
      }
      h1 {
        font-size: 30px;
        margin-left: 10px;
        color: #333;
        text-transform: uppercase;
      }
    }
    > p {
      color: #555;
      margin-bottom: 30px;
      font-weight: 500;
      font-size: 14px;
      text-align: center;
    }
    form {
      display: flex;
      flex-direction: column;
      label {
        margin-bottom: 2px;
        font-size: 14px;
      }
      .MuiFormControl-root {
        &:not(:last-of-type) {
          margin-bottom: 16px;
        }
        input {
          color: #666;
          &[type="password"] {
            -webkit-text-security: disc !important;
          }
        }
      }
      a {
        margin-left: auto;
        margin-bottom: 40px;
      }
      > button {
        &:last-of-type {
          outline: none;
          /* margin-bottom: 60px; */
        }
      }
    }
  }
`;

const schema = yup.object().shape({
  email: yup.string().email().required("Please enter email!"),
  password: yup.string().required("Please enter password!"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Logged In Successfully!");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(Object.values(err.response.data)[0]);
    },
  });

  return (
    <LoginWrapper direction="row" alignItems="center" justifyContent="center">
      <Card elevation={3}>
        <CardContent>
          <Stack
            className="logo"
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <img src={logo} alt="logo" />
            <Typography variant="h1">Omni Village</Typography>
          </Stack>
          <Typography variant="body1">
            Welcome to OmniVillage Dashboard! 👋
          </Typography>
          <form action="">
            <FormLabel>Email</FormLabel>
            <TextField
              type="email"
              variant="outlined"
              size="small"
              {...register("email")}
              placeholder="john@yopmail.com"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <FormLabel>Password</FormLabel>
            <TextField
              variant="outlined"
              size="small"
              placeholder="********"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      disableRipple
                      sx={{ paddingRight: 0 }}
                    >
                      {showPassword ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <Link to="/forgot-password">
              <Typography variant="caption">Forgot Password?</Typography>
            </Link>
            <Button
              variant="contained"
              fullWidth
              disabled={isPending}
              onClick={handleSubmit((data) => mutate(data))}
            >
              Login{" "}
              {isPending && (
                <CircularProgress
                  color="inherit"
                  size="14px"
                  sx={{ marginLeft: "10px" }}
                />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </LoginWrapper>
  );
}
