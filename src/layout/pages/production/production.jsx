import React, { useState } from "react";

import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Modal,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Loading from "../../components/loading";

function Production({
  rows,
  columns,
  isLoading,
  deleteId,
  deleteFn,
  setDeleteId,
  refetch,
}) {
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      toast.success("Item deleted sucessfully");
      refetch();
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err.response.data.msg);
    },
  });

  return (
    <Stack>
      {/* <Button
        variant="contained"
        className="ModalOpeningButtton"
        onClick={() => setopen(true)}
      >
        Add Crop
      </Button> */}
      <Loading isLoading={isLoading} />
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        columnVisibilityModel={{
          _id: false,
        }}
        pageSizeOptions={[5, 10]}
      />
      {/* <Modal open={open} className="modal">
        <Stack
          width={500}
          bgcolor={"#fff"}
          borderRadius={1}
          padding={2}
          color={"#000"}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={"1px solid #333"}
            paddingBottom={1}
          >
            <h3>Add Crop</h3>
            <i
              className="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => setopen(false)}
            ></i>
          </Stack>
          <Stack>
            <h3 style={{ margin: "10px 0" }}>Name :</h3>
            <Stack spacing={2} direction="row" justifyContent="space-between">
              <TextField
                id="outlined-basic"
                label="Name In English"
                variant="outlined"
                size="small"
                style={{ width: "48%" }}
              />
              <TextField
                id="outlined-basic"
                label="Name In Malay"
                size="small"
                style={{ width: "48%" }}
                variant="outlined"
              />
            </Stack>
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select Country :</h3>
            <ToggleButtonGroup
              color="info"
              value={country}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton value="india" style={{ outline: "none" }}>
                India
              </ToggleButton>
              <ToggleButton value="malaysia" style={{ outline: "none" }}>
                Malaysia
              </ToggleButton>
              <ToggleButton value="nepal" style={{ outline: "none" }}>
                Nepal
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select label :</h3>
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="flex-start"
              spacing={2}
            >
              {labels.map((item, id) => (
                <Chip
                  style={{
                    margin: "5px 10px 5px 0",
                    background: item === selectedLabel && "#0080ff",
                    color: item === selectedLabel && "#fff",
                  }}
                  key={item}
                  label={item}
                  variant="contained"
                  onClick={() => setselectedLabel(item)}
                />
              ))}
            </Stack>
          </Stack>
          <Stack spacing={2} direction="row" alignSelf="flex-end" marginTop={3}>
            <Button
              color="warning"
              style={{ outline: "none" }}
              onClick={() => setopen(false)}
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
            >
              add
            </Button>
          </Stack>
        </Stack>
      </Modal> */}
      <Modal open={Boolean(deleteId)} className="modal">
        <Box
          width={500}
          bgcolor={"#fff"}
          borderRadius={1}
          padding={2}
          color={"#000"}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            borderBottom="1px solid #333"
            paddingBottom={1}
          >
            <h3>Delete Corp</h3>
            <i
              className="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => {
                setDeleteId(null);
              }}
            ></i>
          </Stack>
          <Typography variant="body1" marginTop={2}>
            Are you sure, you want to delete this corp?
          </Typography>
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            width={460}
            marginTop={3}
          >
            <Button
              color="warning"
              style={{ outline: "none" }}
              onClick={() => {
                setDeleteId(null);
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
              onClick={() => deleteMutate(deleteId)}
              disabled={isDeletePending}
              sx={{ color: "#fff" }}
            >
              {isDeletePending && (
                <CircularProgress
                  size={16}
                  color="inherit"
                  sx={{ marginRight: "5px" }}
                />
              )}{" "}
              Delete Corp
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
}

export default Production;
