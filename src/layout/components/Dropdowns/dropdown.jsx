/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
// import "./crops.css";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import * as yup from "yup";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import Loading from "../../components/loading";
import {
    addDropdownValues,
    deleteDropdownValues,
    editDropdownValues,
} from "../../../functions/dropdown";
import ReactSelect from "react-select";

const schema = yup.object().shape({
    name: yup.object().shape({
        en: yup.string().required("Name in english is required!"),
        ms: yup.string(),
        dz: yup.string(),
    }),
    type: yup
        .object()
        .shape({
            label: yup.string().required(),
            value: yup.string().required(),
        }),
    dropdown_type: yup.string(),
});

function Dropdown({
    rows,
    columns,
    dropdown_type,
    types,
    isLoading,
    editItem,
    setEdit,
    refetch,
    deleteId,
    setDeleteId,
    sectionName,
    bulkUploadFn,
}) {
    const [open, setOpen] = useState(false);
    const [csvModal, setCsvModal] = useState(false);
    const inputRef = useRef();
    const [sheet, setSheet] = useState("");

    const {
        handleSubmit,
        register,
        formState: { errors },
        control,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            status: 1,
            dropdown_type,
        },
    });

    console.log(errors);

    const { mutate, isPending } = useMutation({
        mutationFn: addDropdownValues,
        onSuccess: () => {
            toast.success("Dropdown value added successfully");
            refetch();
            setEdit(null);
            setOpen(false);
        },
        onError: (err) => {
            toast.error(err.response.data.message);
        },
    });

    const {
        mutate: bulkUpload,
        isPending: bulkUploadPending,
        error,
        isError,
        // reset: resetBulk,
    } = useMutation({
        mutationFn: bulkUploadFn,
        onSuccess: () => {
            toast.success("Dropdown values added successfully");
            refetch();
            setEdit(null);
            setCsvModal(false);
        },
        onError: () => {
            toast.error("Bulk upload failed!");
        },
    });

    const { mutate: editMutate, isPending: isEditPending } = useMutation({
        mutationFn: editDropdownValues,
        onSuccess: () => {
            toast.success("Dropdown value edited successfully");
            refetch();
            setEdit(null);
            setOpen(false);
        },
        onError: (err) => {
            toast.error(err.response.data.message);
        },
    });

    const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
        mutationFn: deleteDropdownValues,
        onSuccess: () => {
            toast.success("Dropdown value deleted successfully");
            refetch();
            setDeleteId(null);
        },
        onError: (err) => {
            toast.error(err.response.data.message);
        },
    });

    useEffect(() => {
        if (editItem) {
            reset({
                name: {
                    en: editItem.eng_name,
                    ms: editItem.malay_name,
                    dz: editItem.dz_name,
                },
                type: { label: types[editItem.type], value: editItem.type },
                status: 1,
                dropdown_type,
            });
        } else {
            reset({
                name: {
                    en: "",
                    ms: "",
                },
                type: null,
                status: 1,
                dropdown_type,
            });
        }
    }, [editItem]);

    const onEditSubmit = (data) => {
        editMutate({
            ...data,
            type: data.type.value,
            dropdown_id: editItem.dropdown_id,
        });
    };

    const onAddSubmit = (data) => {
        mutate({ ...data, type: data.type.value });
    };

    return (
        <Stack>
            <Stack direction="row">
                <Typography
                    variant="h5"
                    sx={{ marginRight: "auto", color: "#333" }}
                >
                    {sectionName}
                </Typography>
                <Button
                    variant="contained"
                    className="ModalOpeningButtton"
                    onClick={() => setOpen(true)}
                >
                    Add Dropdown
                </Button>
                {/* <Button
                    variant="contained"
                    className="ModalOpeningButtton"
                    onClick={() => setCsvModal(true)}
                >
                    Add Sheet
                </Button> */}
            </Stack>
            <DataGrid
                rows={rows}
                columns={columns}
                columnVisibilityModel={{
                    dropdown_id: false,
                    status: false,
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
                        <h3>Add Dropdown</h3>
                        <i
                            className="fa-solid fa-xmark actionIcon"
                            style={{ fontSize: 25 }}
                            onClick={() => {
                                setOpen(false);
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
                                    helperText={errors.name?.en?.message}
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
                                    helperText={errors.name?.ms?.message}
                                />
                            </Grid>
                            <Grid item lg={6}>
                                <TextField
                                    id="outlined-basic"
                                    label="Name In Dzongkha"
                                    size="small"
                                    variant="outlined"
                                    {...register("name.dz")}
                                    fullWidth
                                    error={Boolean(errors.name?.dz)}
                                    helperText={errors.name?.dz?.message}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                    <Stack marginTop={2}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Box>
                                        <InputLabel sx={{ marginBottom: 1 }}>
                                            Select Type
                                        </InputLabel>
                                        <ReactSelect
                                            {...field}
                                            options={Object.entries(types).map(
                                                (_type) => ({
                                                    label: _type[1],
                                                    value: _type[0],
                                                })
                                            )}
                                        />
                                        {fieldState.invalid && (
                                            <FormHelperText
                                                variant="caption"
                                                error
                                            >
                                                {fieldState.error.message}
                                            </FormHelperText>
                                        )}
                                    </Box>
                                );
                            }}
                        />
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        alignSelf="flex-end"
                        marginTop={3}
                    >
                        <Button
                            variant="outlined"
                            color="warning"
                            style={{ outline: "none" }}
                            onClick={() => {
                                setOpen(false);
                                setEdit && setEdit(null);
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            style={{ outline: "none" }}
                            className="ModalOpeningButtton"
                            onClick={handleSubmit(
                                editItem ? onEditSubmit : onAddSubmit
                            )}
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
                        <h3>Delete Dropdown value</h3>
                        <i
                            className="fa-solid fa-xmark actionIcon"
                            style={{ fontSize: 25 }}
                            onClick={() => {
                                setDeleteId(null);
                            }}
                        ></i>
                    </Stack>
                    <Typography variant="body1" marginTop={2}>
                        Are you sure, you want to delete this dropdown value?
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
                            onClick={() =>
                                deleteMutate({ dropdown_type, id: deleteId })
                            }
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
                            Delete Dropdown Value
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
                        <h3>Add Sheet</h3>
                        <i
                            className="fa-solid fa-xmark actionIcon"
                            style={{ fontSize: 25 }}
                            onClick={() => {
                                setCsvModal(false);
                                inputRef.current.value = "";
                            }}
                        ></i>
                    </Stack>
                    <Typography
                        variant="body1"
                        marginTop={2}
                        fontFamily="inherit"
                    >
                        Upload Your Sheet As CSV File
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ marginTop: "10px" }}
                    >
                        <Link
                            download
                            to={`${process.env.REACT_APP_BASE_URL}/uploads/sample.csv`}
                        >
                            <Button variant="outlined" size="small">
                                Download Sample
                            </Button>
                        </Link>
                    </Stack>
                    <label className="dropBox">
                        <i
                            className="fa-solid fa-cloud-arrow-up"
                            style={{ marginRight: 5 }}
                        ></i>
                        {sheet ? sheet.name : "Upload File"}
                        <input
                            type="file"
                            hidden
                            onChange={(e) => {
                                setSheet(e.target.files[0]);
                                // resetBulk();
                            }}
                            accept="text/csv"
                            ref={inputRef}
                        />
                    </label>
                    {isError && (
                        <p className="error_text">
                            {error.response.data.message}
                        </p>
                    )}

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
                                setCsvModal(false);
                                inputRef.current.value = "";
                            }}
                            disabled={bulkUploadPending}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            style={{ outline: "none" }}
                            className="ModalOpeningButtton"
                            sx={{ color: "#fff" }}
                            onClick={() => bulkUpload(sheet)}
                            disabled={bulkUploadPending || !sheet}
                        >
                            Add Sheet
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </Stack>
    );
}

export default Dropdown;
