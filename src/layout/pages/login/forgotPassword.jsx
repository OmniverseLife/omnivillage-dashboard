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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import logo from "../../../assets/logo.png";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { forgot_password } from "../../../functions/admin";
import { toast } from "sonner";

const LoginWrapper = styled(Stack)`
  min-height: 100vh;
  width: 100vw;
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
      color: #5e5873;
      margin-bottom: 5px;
      font-weight: 500;
      font-size: 17px;
    }
    > span {
      color: #6e6b7b;
      display: block;
      line-height: 1.2rem;
      margin-bottom: 15px;
    }
    form {
      display: flex;
      flex-direction: column;
      label {
        margin-bottom: 2px;
        font-size: 14px;
      }
      .MuiFormControl-root {
        margin-bottom: 16px;
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
});

export default function Login() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: forgot_password,
    onSuccess: () => {
      toast.success("Reset email sent successfully!"), navigate("/login");
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
          <Typography variant="body1">Forgot Password? 🔒</Typography>
          <Typography variant="caption">
            Enter your email and we&apos;ll send you instructions
            <br /> to reset your password
          </Typography>
          <form action="">
            <FormLabel>Email</FormLabel>
            <TextField
              variant="outlined"
              size="small"
              type="email"
              {...register("email")}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              placeholder="john@yopmail.com"
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit((data) => mutate(data))}
              disabled={isPending}
            >
              Submit{" "}
              {isPending && (
                <CircularProgress
                  color="inherit"
                  size="14px"
                  sx={{ marginLeft: "10px" }}
                />
              )}
            </Button>
          </form>
          <Link to="/login" style={{ display: "block", marginTop: "20px" }}>
            <Stack direction="row" alignItems="center" justifyContent="center">
              <ArrowBackIosNewIcon
                sx={{ width: "14px", height: "14px", marginRight: "5px" }}
              />
              <Typography variant="caption" sx={{ fontSize: "14px" }}>
                Back to Login
              </Typography>
            </Stack>
          </Link>
        </CardContent>
      </Card>
    </LoginWrapper>
  );
}
