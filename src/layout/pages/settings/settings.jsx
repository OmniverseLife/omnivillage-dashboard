import React, { useState } from "react";
import Wrapper from "../../components/wrapper/wrapper";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Modal,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { DataGrid } from "@mui/x-data-grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addFeed,
  addFishFeed,
  addVillage,
  deleteFeed,
  deleteFishFeed,
  deleteVillage,
  editFeed,
  editFishFeed,
  editVillage,
  fetchFeeds,
  fetchFishFeeds,
  fetchVillages,
} from "../../../functions/others";
import Loading from "../../components/loading";
import { toast } from "sonner";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";

const StyledSettings = styled(Box)`
  .header-row {
    padding-inline: 10px;
    margin-bottom: 30px;
    &:not(:first-of-type) {
      margin-top: 40px;
    }
    h5 {
      color: #333;
    }
  }
`;

const villageSchema = yup.object().shape({
  name: yup.string().required("Please Enter Name"),
  country: yup.string().required("Please Select a Country"),
});

const schema = yup.object().shape({
  name: yup.object().shape({
    en: yup.string().required("Please Enter Name in English"),
    ms: yup.string().required("Please Enter Name in Malay"),
  }),
  country: yup
    .array()
    .of(yup.string())
    .min(1, "Please Select atleast one Country")
    .required(),
});

export default function Settings() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [add_modal, setAdd_modal] = useState(null);
  const [edit_modal, setEdit_modal] = useState(null);
  const [villageDeleteId, setVillageDeleteId] = useState(null);
  const [selectItem, setSelectItem] = useState(null);

  const {
    handleSubmit,
    register,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(villageSchema),
  });

  const {
    handleSubmit: handleFeedsSubmit,
    register: feedsRegister,
    control: feedControl,
    reset: feedReset,
    formState: { errors: feedErrors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["villages"],
    queryFn: fetchVillages,
  });

  const {
    data: feedData = [],
    refetch: feedRefetch,
    isLoading: isFeedLoading,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeeds,
  });

  const {
    data: fishFeedData = [],
    refetch: fishFeedRefetch,
    isLoading: isFishFeedLoading,
  } = useQuery({
    queryKey: ["fish-feed"],
    queryFn: fetchFishFeeds,
  });

  const { mutate: addVillageMutate, isPending: isAddVillagePending } =
    useMutation({
      mutationFn: addVillage,
      onSuccess: () => {
        setAdd_modal(null);
        toast.success("Added Sucessfully");
        reset();
        refetch();
      },
    });

  const { mutate: addFeedMutate, isPending: isAddFeedPending } = useMutation({
    mutationFn: addFeed,
    onSuccess: () => {
      setAdd_modal(null);
      toast.success("Added Sucessfully");
      feedReset();
      feedRefetch();
    },
  });

  const { mutate: addFishFeedMutate, isPending: isAddFishFeedPending } =
    useMutation({
      mutationFn: addFishFeed,
      onSuccess: () => {
        setAdd_modal(null);
        toast.success("Added Sucessfully");
        feedReset();
        fishFeedRefetch();
      },
    });

  const { mutate: editVillageMutate, isPending: isEditVillagePending } =
    useMutation({
      mutationFn: editVillage,
      onSuccess: () => {
        setEdit_modal(null);
        toast.success("Updated Sucessfully");
        reset();
        refetch();
      },
    });

  const { mutate: editFeedMutate, isPending: isEditFeedPending } = useMutation({
    mutationFn: editFeed,
    onSuccess: () => {
      setEdit_modal(null);
      toast.success("Updated Sucessfully");
      feedReset();
      feedRefetch();
    },
  });

  const { mutate: editFishFeedMutate, isPending: isEditFishFeedPending } =
    useMutation({
      mutationFn: editFishFeed,
      onSuccess: () => {
        setEdit_modal(null);
        toast.success("Updated Sucessfully");
        feedReset();
        fishFeedRefetch();
      },
    });

  const { mutate: deleteVillageMutate, isPending: isVillageDeletePending } =
    useMutation({
      mutationFn: deleteVillage,
      onSuccess: () => {
        setVillageDeleteId(null);
        toast.success("Deleted Sucessfully");
        refetch();
      },
    });

  const { mutate: deleteFeedeMutate, isPending: isFeedDeletePending } =
    useMutation({
      mutationFn: deleteFeed,
      onSuccess: () => {
        setVillageDeleteId(null);
        toast.success("Deleted Sucessfully");
        feedRefetch();
      },
    });

  const { mutate: deleteFishFeedMutate, isPending: isFishFeedDeletePending } =
    useMutation({
      mutationFn: deleteFishFeed,
      onSuccess: () => {
        setVillageDeleteId(null);
        toast.success("Deleted Sucessfully");
        fishFeedRefetch();
      },
    });

  const selectDeleteFunction = (data) => {
    switch (data.type) {
      case "village":
        deleteVillageMutate(data._id);
        break;
      case "feed":
        deleteFeedeMutate(data._id);
        break;
      case "fish_feed":
        deleteFishFeedMutate(data._id);
        break;
      default:
        return;
    }
  };

  const village_rows = data.map((_data, index) => ({
    id: index + 1,
    type: "village",
    ..._data,
  }));

  console.log(watch(), selectedRow, edit_modal);

  const village_columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "_id", headerName: "Village ID", width: 200 },
    { field: "type", headerName: "Type", width: 200 },
    { field: "name", headerName: "Name", width: 350 },
    { field: "country", headerName: "Country", width: 350 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      disableClickEventBubbling: true,
      // width: 100,
      renderCell: (params) => {
        return (
          <div>
            <i
              className="fa-solid fa-ellipsis-vertical actionIcon"
              style={{ fontSize: 25, marginLeft: 15, paddingInline: 10 }}
              onClick={(e) => {
                setSelectedRow(params.row);
                setAnchorEl(e.currentTarget);
                // selectData(alcohols[params.row.id]);
              }}
              id={params.row.id}
            ></i>
            <Menu
              anchorEl={anchorEl}
              open={selectedRow?._id === params.row._id && Boolean(anchorEl)}
              onClose={() => {
                setAnchorEl(null);
                setSelectedRow(null);
              }}
              // anchorOrigin={{}}
            >
              <MenuItem
                onClick={() => {
                  reset({
                    name: selectedRow.name,
                    country: selectedRow.country,
                    village_id: selectedRow._id,
                  });
                  setEdit_modal(selectedRow.type);
                  setAnchorEl(null);
                }}
              >
                <Stack direction="row" alignItems="center">
                  <i
                    className="fa-regular fa-file-lines"
                    style={{ marginRight: 10 }}
                  ></i>
                  Edit
                </Stack>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setVillageDeleteId({ type: "village", _id: selectedRow._id });
                  setAnchorEl(null);
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ color: "#f45536" }}
                >
                  <i
                    className="fa-regular fa-trash-can"
                    style={{ marginRight: 10 }}
                  ></i>
                  Delete
                </Stack>
              </MenuItem>
            </Menu>
          </div>
        );
      },
    },
  ];

  const feed_columns = [
    { field: "id", headerName: "S.NO", width: 150 },
    { field: "_id", headerName: "Feed ID", width: 200 },
    { field: "type", headerName: "Type", width: 100 },
    { field: "name_en", headerName: "Enlish Name", width: 250 },
    { field: "name_ms", headerName: "Malay Name", width: 250 },
    { field: "country", headerName: "Country", width: 250 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      disableClickEventBubbling: true,
      // width: 100,
      renderCell: (params) => {
        return (
          <div>
            <i
              className="fa-solid fa-ellipsis-vertical actionIcon"
              style={{ fontSize: 25, marginLeft: 15, paddingInline: 10 }}
              onClick={(e) => {
                setSelectedRow(params.row);
                setAnchorEl(e.currentTarget);
                // selectData(alcohols[params.row.id]);
              }}
              id={params.row.id}
            ></i>
            <Menu
              anchorEl={anchorEl}
              open={selectedRow?._id === params.row._id && Boolean(anchorEl)}
              onClose={() => {
                setAnchorEl(null);
                setSelectedRow(null);
              }}
              // anchorOrigin={{}}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setEdit_modal(selectedRow.type);
                  feedReset({
                    name: {
                      en: selectedRow.name_en,
                      ms: selectedRow.name_ms,
                    },
                    country: selectedRow.country,
                    feed_id: selectedRow._id,
                  });
                }}
              >
                <Stack direction="row" alignItems="center">
                  <i
                    className="fa-regular fa-file-lines"
                    style={{ marginRight: 10 }}
                  ></i>
                  Edit
                </Stack>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setVillageDeleteId({
                    type: selectedRow.type,
                    _id: selectedRow._id,
                  });
                  setAnchorEl(null);
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ color: "#f45536" }}
                >
                  <i
                    className="fa-regular fa-trash-can"
                    style={{ marginRight: 10 }}
                  ></i>
                  Delete
                </Stack>
              </MenuItem>
            </Menu>
          </div>
        );
      },
    },
  ];

  const feed_rows = feedData.map((_data, index) => ({
    id: index + 1,
    name_en: _data.name.en,
    name_ms: _data.name.ms,
    type: "feed",
    ..._data,
  }));

  const fish_feed_rows = fishFeedData.map((_data, index) => ({
    id: index + 1,
    name_en: _data.name.en,
    name_ms: _data.name.ms,
    type: "fish_feed",
    ..._data,
  }));

  return (
    <Wrapper>
      <Loading isLoading={isLoading || isFeedLoading || isFishFeedLoading} />
      <StyledSettings>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="header-row"
        >
          <Typography variant="h5">Villages</Typography>
          <Button variant="contained" onClick={() => setAdd_modal("village")}>
            Add
          </Button>
        </Stack>
        <DataGrid
          columns={village_columns}
          rows={village_rows}
          initialState={{
            columns: {
              columnVisibilityModel: {
                _id: false,
                type: false,
              },
            },
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            toolbar: { printOptions: { disableToolbarButton: true } },
          }}
          pageSizeOptions={[5, 10]}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="header-row"
        >
          <Typography variant="h5">Feeds</Typography>
          <Button variant="contained" onClick={() => setAdd_modal("feed")}>
            Add
          </Button>
        </Stack>
        <DataGrid
          columns={feed_columns}
          rows={feed_rows}
          initialState={{
            columns: {
              columnVisibilityModel: {
                _id: false,
                type: false,
              },
            },
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            toolbar: { printOptions: { disableToolbarButton: true } },
          }}
          pageSizeOptions={[5, 10]}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="header-row"
        >
          <Typography variant="h5">Fish Feeds</Typography>
          <Button variant="contained" onClick={() => setAdd_modal("fish_feed")}>
            Add
          </Button>
        </Stack>
        <DataGrid
          columns={feed_columns}
          rows={fish_feed_rows}
          initialState={{
            columns: {
              columnVisibilityModel: {
                _id: false,
                type: false,
              },
            },
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            toolbar: { printOptions: { disableToolbarButton: true } },
          }}
          pageSizeOptions={[5, 10]}
        />
      </StyledSettings>

      {/* Add/Edit Modal Village */}
      <Modal
        open={add_modal === "village" || edit_modal === "village"}
        className="modal"
      >
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
            <h3 style={{ textTransform: "capitalize" }}>
              {edit_modal ? "Edit" : "Add"}{" "}
              {add_modal?.replace("_", " ") || edit_modal?.replace("_", " ")}
            </h3>
            <i
              className="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => {
                setAdd_modal(null);
                setEdit_modal(null);
                reset();
              }}
            ></i>
          </Stack>
          <Stack>
            <h3 style={{ margin: "10px 0" }}>Name :</h3>
            <TextField
              type="text"
              {...register("name")}
              fullWidth
              error={Boolean(errors.name)}
              size="small"
              helperText={errors.name?.message}
            />
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select Country :</h3>
            <Controller
              name="country"
              control={control}
              render={({ field: { value, onChange } }) => (
                <ToggleButtonGroup
                  color="info"
                  exclusive
                  value={value}
                  onChange={(_, country) => onChange(country)}
                  aria-label="Platform"
                >
                  <ToggleButton value="india" style={{ outline: "none" }}>
                    India
                  </ToggleButton>
                  <ToggleButton value="malaysia" style={{ outline: "none" }}>
                    Malaysia
                  </ToggleButton>
                  <ToggleButton value="bhutan" style={{ outline: "none" }}>
                    Bhutan
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            />
            <Typography variant="caption" sx={{ color: "red" }}>
              {errors.country?.message}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row" alignSelf="flex-end" marginTop={3}>
            <Button
              variant="outlined"
              color="warning"
              style={{ outline: "none" }}
              onClick={() => {
                setAdd_modal(null);
                setEdit_modal(null);
                reset();
              }}
              disabled={isAddVillagePending || isEditVillagePending}
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
              onClick={handleSubmit(
                edit_modal ? editVillageMutate : addVillageMutate
              )}
              // onClick={handleSubmit(editItem ? onEditSubmit : onAddSubmit)}
              disabled={isAddVillagePending || isEditVillagePending}
              sx={{ color: "#fff" }}
            >
              {isAddVillagePending ||
                (isEditVillagePending && (
                  <CircularProgress
                    size={16}
                    color="inherit"
                    sx={{ marginRight: "5px" }}
                  />
                ))}{" "}
              {edit_modal ? "update" : "add"}
            </Button>
          </Stack>
        </Stack>
      </Modal>

      {/* Add/Edit Modal Feeds */}
      <Modal
        open={
          Boolean(add_modal && add_modal !== "village") ||
          Boolean(edit_modal && edit_modal !== "village")
        }
        className="modal"
      >
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
            <h3 style={{ textTransform: "capitalize" }}>
              {edit_modal ? "Edit" : "Add"}{" "}
              {add_modal?.replace("_", " ") || edit_modal?.replace("_", " ")}
            </h3>
            <i
              className="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => {
                setAdd_modal(null);
                setEdit_modal(null);
                feedReset();
              }}
            ></i>
          </Stack>
          <Stack>
            <h3 style={{ margin: "10px 0" }}>Name :</h3>
            <Grid container spacing={2}>
              <Grid item lg={6}>
                <TextField
                  id="outlined-basic"
                  label="Name In English"
                  variant="outlined"
                  size="small"
                  {...feedsRegister("name.en")}
                  fullWidth
                  error={Boolean(feedErrors.name?.en)}
                  helperText={feedErrors.name?.en?.message}
                />
              </Grid>
              <Grid item lg={6}>
                <TextField
                  id="outlined-basic"
                  label="Name In Malay"
                  size="small"
                  variant="outlined"
                  {...feedsRegister("name.ms")}
                  fullWidth
                  error={Boolean(feedErrors.name?.ms)}
                  helperText={feedErrors.name?.ms?.message}
                />
              </Grid>
            </Grid>
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select Country :</h3>
            <Controller
              name="country"
              control={feedControl}
              render={({ field: { value, onChange } }) => (
                <ToggleButtonGroup
                  color="info"
                  value={value}
                  onChange={(_, country) => onChange(country)}
                  aria-label="Platform"
                >
                  <ToggleButton value="india" style={{ outline: "none" }}>
                    India
                  </ToggleButton>
                  <ToggleButton value="malaysia" style={{ outline: "none" }}>
                    Malaysia
                  </ToggleButton>
                  <ToggleButton value="bhutan" style={{ outline: "none" }}>
                    Bhutan
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            />
            <Typography variant="caption" sx={{ color: "red" }}>
              {feedErrors.country?.message}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row" alignSelf="flex-end" marginTop={3}>
            <Button
              variant="outlined"
              color="warning"
              style={{ outline: "none" }}
              onClick={() => {
                setAdd_modal(null);
                setEdit_modal(null);
                feedReset();
              }}
              disabled={
                isAddFeedPending ||
                isAddFishFeedPending ||
                isEditFeedPending ||
                isEditFishFeedPending
              }
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
              onClick={handleFeedsSubmit(
                edit_modal
                  ? edit_modal === "feed"
                    ? editFeedMutate
                    : editFishFeedMutate
                  : add_modal === "feed"
                  ? addFeedMutate
                  : addFishFeedMutate
              )}
              // onClick={handleSubmit(editItem ? onEditSubmit : onAddSubmit)}
              disabled={
                isAddFeedPending ||
                isAddFishFeedPending ||
                isEditFeedPending ||
                isEditFishFeedPending
              }
              sx={{ color: "#fff" }}
            >
              {(isAddFeedPending ||
                isAddFishFeedPending ||
                isEditFeedPending ||
                isEditFishFeedPending) && (
                <CircularProgress
                  size={16}
                  color="inherit"
                  sx={{ marginRight: "5px" }}
                />
              )}{" "}
              {edit_modal ? "Update" : "add"}
            </Button>
          </Stack>
        </Stack>
      </Modal>

      {/* Delete Modal */}
      <Modal open={Boolean(villageDeleteId)} className="modal">
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
            <h3>Delete Entry</h3>
            <i
              className="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => {
                setVillageDeleteId(null);
              }}
            ></i>
          </Stack>
          <Typography variant="body1" marginTop={2}>
            Are you sure, you want to delete this record?
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
              variant="outlined"
              color="warning"
              style={{ outline: "none" }}
              onClick={() => {
                setVillageDeleteId(null);
              }}
              disabled={
                isVillageDeletePending ||
                isFeedDeletePending ||
                isFishFeedDeletePending
              }
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
              onClick={() => selectDeleteFunction(villageDeleteId)}
              disabled={
                isVillageDeletePending ||
                isFeedDeletePending ||
                isFishFeedDeletePending
              }
              sx={{ color: "#fff" }}
            >
              {isVillageDeletePending ||
                isFeedDeletePending ||
                (isFishFeedDeletePending && (
                  <CircularProgress
                    size={16}
                    color="inherit"
                    sx={{ marginRight: "5px" }}
                  />
                ))}
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Wrapper>
  );
}
