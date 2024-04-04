import React, { useEffect, useState } from "react";
// import "./crops.css";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
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
import Loading from "../../components/loading";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchLabels } from "../../../functions/others";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";

const schema = yup.object().shape({
  name: yup.object().shape({
    en: yup.string().required("Name in english is required!"),
    ms: yup.string().required("Name in malay is required!"),
  }),
  status: yup.number(),
});

function Crops({
  rows,
  columns,
  isLoading,
  editItem,
  setEdit,
  editFn,
  refetch,
  addFn,
  deleteFn,
  deleteId,
  setDeleteId,
}) {
  const [open, setopen] = useState(false);
  const [csvModal, setcsvModal] = useState(false);

  const [country, setcountry] = useState(() => ["india"]);
  const [selectedLabel, setselectedLabel] = useState(null);
  const [additionalError, setAdditionalError] = useState({
    country: "",
  });

  const { data: labels = [], isLoading: isLabelsLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 1,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addFn,
    onSuccess: () => {
      toast.success("Crop added sucessfully");
      refetch();
      setEdit(null);
      setopen(false);
    },
    onError: (err) => {
      toast.error(err.response.data.msg);
    },
  });

  const { mutate: editMutate, isPending: isEditPending } = useMutation({
    mutationFn: editFn,
    onSuccess: () => {
      toast.success("Crop edited sucessfully");
      refetch();
      setEdit(null);
      setopen(false);
    },
    onError: (err) => {
      toast.error(err.response.data.msg);
    },
  });

  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      toast.success("Crop deleted sucessfully");
      refetch();
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err.response.data.msg);
    },
  });

  const handleChange = (event, newcountry) => {
    setcountry(newcountry);
  };

  useEffect(() => {
    if (editItem) {
      reset({
        name: {
          en: editItem.Engname,
          ms: editItem.Malayname,
        },
        status: 1,
      });
      setselectedLabel(editItem.label?._id);
      setcountry(() => editItem.country?.split(", "));
    } else {
      reset({
        name: {
          en: "",
          ms: "",
        },
        status: 1,
      });
      setselectedLabel(null);
      setcountry(() => []);
    }
  }, [editItem]);

  const onEditSubmit = (data) => {
    if (country.length === 0) {
      setAdditionalError({ country: "Please select atleast one country!" });
      return;
    }
    editMutate({
      ...data,
      country,
      label: selectedLabel,
      crop_id: editItem.crop_id,
    });
  };

  const onAddSubmit = (data) => {
    if (country.length === 0) {
      setAdditionalError({ country: "Please select atleast one country!" });
      return;
    }
    mutate({
      ...data,
      country,
      label: selectedLabel,
    });
  };

  return (
    <Stack>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          className="ModalOpeningButtton"
          onClick={() => setopen(true)}
        >
          Add Crop
        </Button>
        <Button
          variant="contained"
          className="ModalOpeningButtton"
          onClick={() => setcsvModal(true)}
        >
          Add Sheet
        </Button>
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        columnVisibilityModel={{
          crop_id: false,
        }}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        slots={{ toolbar: CustomToolbar }}
        pageSizeOptions={[5, 10]}
      />
      <Loading isLoading={isLoading} />
      <Modal open={Boolean(editItem) || open} className="modal">
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
              onClick={() => {
                setopen(false);
                setEdit && setEdit(null);
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
                  {...register("name.en")}
                  fullWidth
                  error={Boolean(errors.name?.en)}
                  helperText={errors.name?.en}
                />
              </Grid>
              <Grid item lg={6}>
                <TextField
                  id="outlined-basic"
                  label="Name In Malay"
                  size="small"
                  variant="outlined"
                  {...register("name.ms")}
                  fullWidth
                  error={Boolean(errors.name?.ms)}
                  helperText={errors.name?.ms}
                />
              </Grid>
            </Grid>
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select Country :</h3>
            <ToggleButtonGroup
              color="info"
              value={country}
              onChange={handleChange}
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
            <Typography variant="caption">{additionalError.country}</Typography>
          </Stack>
          <Stack marginTop={2}>
            <h3 style={{ margin: "10px 0" }}>Select label :</h3>
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="flex-start"
              spacing={2}
            >
              {labels.map((_label) => (
                <Chip
                  style={{
                    margin: "5px 10px 5px 0",
                    background: _label._id === selectedLabel && "#0080ff",
                    color: _label._id === selectedLabel && "#fff",
                    textTransform: "capitalize",
                  }}
                  key={_label._id}
                  label={_label.name}
                  variant="contained"
                  onClick={() =>
                    setselectedLabel((prev) =>
                      prev === _label._id ? null : _label._id
                    )
                  }
                />
              ))}
            </Stack>
            {/* <Typography variant="caption">{additionalError.label}</Typography> */}
          </Stack>
          <Stack spacing={2} direction="row" alignSelf="flex-end" marginTop={3}>
            <Button
              variant="outlined"
              color="warning"
              style={{ outline: "none" }}
              onClick={() => {
                setopen(false);
                setEdit && setEdit(null);
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
              onClick={handleSubmit(editItem ? onEditSubmit : onAddSubmit)}
              disabled={isPending || isEditPending}
              sx={{ color: "#fff" }}
            >
              {(isPending || isEditPending) && (
                <CircularProgress
                  size={16}
                  color="inherit"
                  sx={{ marginRight: "5px" }}
                />
              )}{" "}
              {editItem ? "edit" : "add"}
            </Button>
          </Stack>
        </Stack>
      </Modal>
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
              variant="outlined"
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
              )}
              Delete Corp
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* csv modal */}
      <Modal open={csvModal} className="modal">
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
            <h3>Add Shhet</h3>
            <i
              className="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => {
                setcsvModal(false);
              }}
            ></i>
          </Stack>
          <Typography variant="body1" marginTop={2} fontFamily="inherit">
            Upload Your Sheet As CSV File
          </Typography>
          <label className="dropBox">
            <i
              class="fa-solid fa-cloud-arrow-up"
              style={{ marginRight: 5 }}
            ></i>
            Upload File
            <input type="file" hidden />
          </label>

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
            >
              Close
            </Button>
            <Button
              variant="contained"
              style={{ outline: "none" }}
              className="ModalOpeningButtton"
              sx={{ color: "#fff" }}
            >
              Add Sheet
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
}

export default Crops;
